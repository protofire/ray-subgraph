import { Bytes } from '@graphprotocol/graph-ts'

import { LogMintOpportunityToken, LogMintRAYT } from '../generated/PortfolioManager/PortfolioManager'

import { User, RAYToken, Opportunity, Portfolio, OpportunityToken } from '../generated/schema'

export function handleMintRAYToken(event: LogMintRAYT): void {
  let user = getOrCreateUser(event.params.beneficiary)
  let rayToken = getOrCreateRayToken(event.params.tokenId)
  let portfolio = getOrCreatePortfolio(event.params.portfolioId)

  rayToken.owner = event.params.beneficiary.toHexString()
  rayToken.value = event.params.value
  rayToken.portfolio = portfolio.id

  user.save()
  rayToken.save()
}

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
