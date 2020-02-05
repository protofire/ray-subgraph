import { Bytes, BigInt, BigDecimal, log, Address } from '@graphprotocol/graph-ts'
import {
  LogMintOpportunityToken,
  LogMintRAYT,
  LogDepositToRAYT,
  LogWithdrawFromRAYT,
  LogBurnRAYT,
} from '../generated/PortfolioManager/PortfolioManager'
import { RAYToken, Opportunity } from '../generated/schema'
import { ERC20 } from '../generated/PortfolioManager/ERC20'
import { toDecimal, DEFAULT_DECIMALS } from './utils/decimals'
import {
  DAI_ADDRESS,
  SAI_ADDRESS,
  WETH_ADDRESS,
  USDC_ADDRESS,
  GENESIS_ADDRESS,
  ZERO,
  ZERO_DECIMAL,
} from './utils/constants'
import {
  getTokenAddressFromPortfolioId,
  getOrCreateUser,
  getOrCreateAsset,
  getOrCreateRayToken,
  getOrCreateMintEvent,
  getOrCreateBurnEvent,
  getOrCreatePortfolio,
  getOrCreateDepositEvent,
  getOrCreateWithdrawEvent,
  getOrCreateOpportunityToken,
} from './utils/creationHelpers'

export function handleMintRAYToken(event: LogMintRAYT): void {
  let user = getOrCreateUser(event.params.beneficiary)
  let rayToken = getOrCreateRayToken(event.params.tokenId)
  let portfolio = getOrCreatePortfolio(event.params.portfolioId.toHexString())
  let tokenEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let tokenEvent = getOrCreateMintEvent(tokenEventId)
  let asset = getOrCreateAsset(Address.fromString(portfolio.asset))

  rayToken.owner = event.params.beneficiary.toHexString()
  rayToken.rawValue = event.params.value
  rayToken.value = toDecimal(rayToken.rawValue, asset.decimals)
  rayToken.portfolio = portfolio.id
  rayToken.isActive = true

  tokenEvent.block = event.block.number
  tokenEvent.timestamp = event.block.timestamp
  tokenEvent.transaction = event.transaction.hash

  tokenEvent.minter = event.address
  tokenEvent.token = rayToken.id
  tokenEvent.rawValue = event.params.value
  tokenEvent.value = toDecimal(tokenEvent.rawValue, asset.decimals)

  user.save()
  rayToken.save()
  tokenEvent.save()
}

export function handleDepositToRAYToken(event: LogDepositToRAYT): void {
  let rayToken = RAYToken.load(event.params.tokenId.toHexString())
  let tokenEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let tokenEvent = getOrCreateDepositEvent(tokenEventId)

  if (rayToken == null) {
    log.warning('[DEPOSIT] RAYToken with ID: {} does not exist...', [event.params.tokenId.toHexString()])
  } else {
    let portfolio = getOrCreatePortfolio(rayToken.portfolio)
    let asset = getOrCreateAsset(Address.fromString(portfolio.asset))

    tokenEvent.block = event.block.number
    tokenEvent.timestamp = event.block.timestamp
    tokenEvent.transaction = event.transaction.hash

    tokenEvent.sender = event.address
    tokenEvent.token = rayToken.id
    tokenEvent.rawValue = event.params.value
    tokenEvent.value = toDecimal(tokenEvent.rawValue, asset.decimals)
    tokenEvent.tokenRawValueBefore = event.params.tokenValue
    tokenEvent.tokenValueBefore = toDecimal(tokenEvent.tokenRawValueBefore, asset.decimals)

    rayToken.rawValue = event.params.tokenValue + event.params.value
    rayToken.value = toDecimal(rayToken.rawValue, asset.decimals)

    tokenEvent.tokenRawValueAfter = rayToken.rawValue
    tokenEvent.tokenValueAfter = rayToken.value

    rayToken.save()
    tokenEvent.save()
  }
}

export function handleWithdrawFromRAYToken(event: LogWithdrawFromRAYT): void {
  let rayToken = RAYToken.load(event.params.tokenId.toHexString())
  let tokenEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let tokenEvent = getOrCreateWithdrawEvent(tokenEventId)

  if (rayToken == null) {
    log.warning('[WITHDRAW] RAYToken with ID: {} does not exist...', [event.params.tokenId.toHexString()])
  } else {
    let portfolio = getOrCreatePortfolio(rayToken.portfolio)
    let asset = getOrCreateAsset(Address.fromString(portfolio.asset))

    tokenEvent.block = event.block.number
    tokenEvent.timestamp = event.block.timestamp
    tokenEvent.transaction = event.transaction.hash

    tokenEvent.token = rayToken.id
    tokenEvent.rawValue = event.params.value
    tokenEvent.value = toDecimal(tokenEvent.rawValue, asset.decimals)
    tokenEvent.tokenRawValueBefore = event.params.tokenValue
    tokenEvent.tokenValueBefore = toDecimal(tokenEvent.tokenRawValueBefore, asset.decimals)

    rayToken.rawValue = event.params.tokenValue - event.params.value
    rayToken.value = toDecimal(rayToken.rawValue, asset.decimals)

    tokenEvent.tokenRawValueAfter = rayToken.rawValue
    tokenEvent.tokenValueAfter = rayToken.value

    rayToken.save()
    tokenEvent.save()
  }
}

export function handleBurnRAYToken(event: LogBurnRAYT): void {
  let rayToken = RAYToken.load(event.params.tokenId.toHexString())
  let tokenEventId = event.transaction.hash.toHex() + '-' + event.logIndex.toString()
  let tokenEvent = getOrCreateBurnEvent(tokenEventId)

  if (rayToken == null) {
    log.warning('[BURN] RAYToken with ID: {} does not exist...', [event.params.tokenId.toHexString()])
  } else {
    let portfolio = getOrCreatePortfolio(rayToken.portfolio)
    let asset = getOrCreateAsset(Address.fromString(portfolio.asset))

    tokenEvent.block = event.block.number
    tokenEvent.timestamp = event.block.timestamp
    tokenEvent.transaction = event.transaction.hash

    tokenEvent.rawValue = event.params.value
    tokenEvent.value = toDecimal(tokenEvent.rawValue, asset.decimals)
    tokenEvent.token = rayToken.id

    rayToken.rawValue = ZERO
    rayToken.value = ZERO_DECIMAL
    rayToken.isActive = false

    rayToken.save()
    tokenEvent.save()
  }
}

export function handleMintOpportunityToken(event: LogMintOpportunityToken): void {
  let portfolio = getOrCreatePortfolio(event.params.portfolioId.toHexString())
  let token = getOrCreateOpportunityToken(event.params.tokenId)

  // We probably should replace the Opportunity ID with something a little bit more related
  let opportunity = new Opportunity(event.transaction.hash.toHexString() + '-' + event.logIndex.toString())
  opportunity.portfolio = portfolio.id
  opportunity.token = token.id

  opportunity.save()
}
