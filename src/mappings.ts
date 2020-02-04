import { Bytes, BigInt, log } from '@graphprotocol/graph-ts'

import {
  LogMintOpportunityToken,
  LogMintRAYT,
  LogDepositToRAYT,
  LogWithdrawFromRAYT,
  LogBurnRAYT,
} from '../generated/PortfolioManager/PortfolioManager'

import {
  User,
  RAYToken,
  Opportunity,
  Portfolio,
  OpportunityToken,
  DepositEvent,
  WithdrawEvent,
  MintEvent,
  BurnEvent,
} from '../generated/schema'

let ZERO = BigInt.fromI32(0)

export function handleMintRAYToken(event: LogMintRAYT): void {
  let user = getOrCreateUser(event.params.beneficiary)
  let rayToken = getOrCreateRayToken(event.params.tokenId)
  let portfolio = getOrCreatePortfolio(event.params.portfolioId)
  let tokenEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let tokenEvent = new MintEvent(tokenEventId)

  rayToken.owner = event.params.beneficiary.toHexString()
  rayToken.value = event.params.value
  rayToken.portfolio = portfolio.id
  rayToken.isActive = true

  tokenEvent.block = event.block.number
  tokenEvent.timestamp = event.block.timestamp
  tokenEvent.transaction = event.transaction.hash

  tokenEvent.minter = event.address
  tokenEvent.token = rayToken.id
  tokenEvent.value = event.params.value

  user.save()
  rayToken.save()
  tokenEvent.save()
}

export function handleDepositToRAYToken(event: LogDepositToRAYT): void {
  let rayToken = RAYToken.load(event.params.tokenId.toHexString())
  let tokenEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let tokenEvent = new DepositEvent(tokenEventId)

  if (rayToken == null) {
    log.warning('[DEPOSIT] RAYToken with ID: {} does not exist...', [event.params.tokenId.toHexString()])
  } else {
    tokenEvent.block = event.block.number
    tokenEvent.timestamp = event.block.timestamp
    tokenEvent.transaction = event.transaction.hash

    tokenEvent.sender = event.address
    tokenEvent.value = event.params.value
    tokenEvent.token = rayToken.id
    tokenEvent.tokenValueBefore = rayToken.value

    rayToken.value = event.params.tokenValue + event.params.value

    tokenEvent.tokenValueAfter = rayToken.value

    rayToken.save()
    tokenEvent.save()
  }
}

export function handleWithdrawFromRAYToken(event: LogWithdrawFromRAYT): void {
  let rayToken = RAYToken.load(event.params.tokenId.toHexString())
  let tokenEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let tokenEvent = new WithdrawEvent(tokenEventId)

  if (rayToken == null) {
    log.warning('[WITHDRAW] RAYToken with ID: {} does not exist...', [event.params.tokenId.toHexString()])
  } else {
    tokenEvent.block = event.block.number
    tokenEvent.timestamp = event.block.timestamp
    tokenEvent.transaction = event.transaction.hash

    tokenEvent.value = event.params.value
    tokenEvent.token = rayToken.id
    tokenEvent.tokenValueBefore = rayToken.value

    rayToken.value = event.params.tokenValue - event.params.value

    tokenEvent.tokenValueAfter = rayToken.value

    rayToken.save()
    tokenEvent.save()
  }
}

export function handleBurnRAYToken(event: LogBurnRAYT): void {
  let rayToken = RAYToken.load(event.params.tokenId.toHexString())
  let tokenEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let tokenEvent = new BurnEvent(tokenEventId)

  if (rayToken == null) {
    log.warning('[BURN] RAYToken with ID: {} does not exist...', [event.params.tokenId.toHexString()])
  } else {
    tokenEvent.block = event.block.number
    tokenEvent.timestamp = event.block.timestamp
    tokenEvent.transaction = event.transaction.hash

    tokenEvent.value = event.params.value
    tokenEvent.token = rayToken.id

    rayToken.value = ZERO
    rayToken.isActive = false

    rayToken.save()
    tokenEvent.save()
  }
}

export function handleMintOpportunityToken(event: LogMintOpportunityToken): void {
  let portfolio = getOrCreatePortfolio(event.params.portfolioId)
  let token = getOrCreateOpportunityToken(event.params.tokenId)

  // We probably should replace the Opportunity ID with something a little bit more related
  let opportunity = new Opportunity(event.transaction.hash.toHexString() + '-' + event.logIndex.toString())
  opportunity.portfolio = portfolio.id
  opportunity.token = token.id

  opportunity.save()
}

function getOrCreateUser(address: Bytes): User {
  let user = User.load(address.toHexString())

  if (user == null) {
    user = new User(address.toHexString())
    user.address = address
  }

  return user as User
}

function getOrCreateRayToken(tokenId: Bytes): RAYToken {
  let token = RAYToken.load(tokenId.toHexString())

  if (token == null) {
    token = new RAYToken(tokenId.toHexString())
  }

  return token as RAYToken
}

function getOrCreatePortfolio(portfolioId: Bytes, persist: boolean = true): Portfolio {
  let portfolio = Portfolio.load(portfolioId.toHexString())

  if (portfolio == null) {
    portfolio = new Portfolio(portfolioId.toHexString())

    if (persist) {
      portfolio.save()
    }
  }

  return portfolio as Portfolio
}

function getOrCreateOpportunityToken(tokenId: Bytes, persist: boolean = true): OpportunityToken {
  let token = OpportunityToken.load(tokenId.toHexString())

  if (token == null) {
    token = new OpportunityToken(tokenId.toHexString())

    if (persist) {
      token.save()
    }
  }

  return token as OpportunityToken
}
