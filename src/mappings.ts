import { Bytes, BigInt, log } from '@graphprotocol/graph-ts'

import {
  LogMintOpportunityToken,
  LogMintRAYT,
  LogDepositToRAYT,
  LogWithdrawFromRAYT,
} from '../generated/PortfolioManager/PortfolioManager'

import { User, RAYToken, Opportunity, Portfolio, OpportunityToken, RAYTokenTransaction } from '../generated/schema'

const depositType = 'DEPOSIT'
const withdrawType = 'WITHDRAW'
const mintType = 'MINT'
const burnType = 'BURN'

let ZERO = BigInt.fromI32(0)

export function handleMintRAYToken(event: LogMintRAYT): void {
  let user = getOrCreateUser(event.params.beneficiary)
  let rayToken = getOrCreateRayToken(event.params.tokenId)
  let portfolio = getOrCreatePortfolio(event.params.portfolioId)
  let transaction = getOrCreateRayTokenTransaction(event.transaction.hash)

  rayToken.owner = event.params.beneficiary.toHexString()
  rayToken.value = event.params.value
  rayToken.portfolio = portfolio.id

  transaction.token = rayToken.id
  transaction.value = event.params.value
  transaction.tokenValueBefore = ZERO
  transaction.tokenValueAfter = event.params.value
  transaction.type = mintType
  transaction.timestamp = event.block.timestamp

  user.save()
  rayToken.save()
  transaction.save()
}

export function handleDepositToRAYToken(event: LogDepositToRAYT): void {
  let rayToken = RAYToken.load(event.params.tokenId.toHexString())
  let transaction = getOrCreateRayTokenTransaction(event.transaction.hash)

  if (rayToken == null) {
    log.warning('RAYToken with ID: {} does not exist...', [event.params.tokenId.toHexString()])
  } else {
    transaction.type = depositType
    transaction.value = event.params.value
    transaction.token = rayToken.id
    transaction.timestamp = event.block.timestamp
    transaction.tokenValueBefore = rayToken.value

    rayToken.value = event.params.tokenValue + event.params.value

    transaction.tokenValueAfter = rayToken.value

    rayToken.save()
    transaction.save()
  }
}

export function handleWithdrawFromRAYToken(event: LogWithdrawFromRAYT): void {}

export function handleMintOpportunityToken(event: LogMintOpportunityToken): void {
  let portfolio = getOrCreatePortfolio(event.params.portfolioId)
  let token = getOrCreateOpportunityToken(event.params.tokenId)

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

function getOrCreateRayTokenTransaction(id: Bytes): RAYTokenTransaction {
  let transaction = RAYTokenTransaction.load(id.toHexString())

  if (transaction == null) {
    transaction = new RAYTokenTransaction(id.toHexString())
  }

  return transaction as RAYTokenTransaction
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
