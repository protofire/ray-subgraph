import { Bytes } from '@graphprotocol/graph-ts'

import { LogMintOpportunityToken } from '../generated/PortfolioManager/PortfolioManager'

import { Opportunity, Portfolio, Token } from '../generated/schema'

export function handleMintOpportunityToken(event: LogMintOpportunityToken): void {
  let portfolio = getOrCreatePortfolio(event.params.portfolioId)
  let token = getOrCreateToken(event.params.tokenId)

  let opportunity = new Opportunity(event.transaction.hash.toHexString() + '-' + event.logIndex.toString())
  opportunity.portfolio = portfolio.id
  opportunity.token = token.id

  opportunity.save()
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

function getOrCreateToken(tokenId: Bytes, persist: boolean = true): Token {
  let token = Token.load(tokenId.toHexString())

  if (token == null) {
    token = new Token(tokenId.toHexString())

    if (persist) {
      token.save()
    }
  }

  return token as Token
}
