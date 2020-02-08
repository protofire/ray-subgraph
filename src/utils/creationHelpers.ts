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
  Asset,
} from '../../generated/schema'
import { Bytes, BigInt, BigDecimal, log, Address } from '@graphprotocol/graph-ts'
import { ERC20 } from '../../generated/PortfolioManager/ERC20'
import { DAI_ADDRESS, SAI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS, GENESIS_ADDRESS, ZERO, ZERO_DECIMAL } from './constants'
import { toDecimal, DEFAULT_DECIMALS } from './decimals'

function getOrCreateUser(address: Bytes): User {
  let user = User.load(address.toHexString())

  if (user == null) {
    user = new User(address.toHexString())
    user.address = address
  }

  return user as User
}

function getOrCreateRayToken(tokenId: String): RAYToken {
  let token = RAYToken.load(tokenId)

  if (token == null) {
    token = new RAYToken(tokenId)
  }

  return token as RAYToken
}

function getOrCreatePortfolio(portfolioId: String, persist: boolean = true): Portfolio {
  let portfolio = Portfolio.load(portfolioId)

  if (portfolio == null) {
    portfolio = new Portfolio(portfolioId)
    let assetAddress = getTokenAddressFromPortfolioId(portfolioId)
    let asset = getOrCreateAsset(assetAddress)

    portfolio.asset = asset.id

    if (persist) {
      portfolio.save()
    }
  }

  return portfolio as Portfolio
}

function getOrCreateOpportunity(opportunityId: String, persist: boolean = true): Opportunity {
  let opportunity = Opportunity.load(opportunityId)

  if (opportunity == null) {
    opportunity = new Opportunity(opportunityId)

    if (persist) {
      opportunity.save()
    }
  }

  return opportunity as Opportunity
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

function getOrCreateMintEvent(eventId: String): MintEvent {
  let event = MintEvent.load(eventId)

  if (event == null) {
    event = new MintEvent(eventId)
  }

  return event as MintEvent
}

function getOrCreateBurnEvent(eventId: String): BurnEvent {
  let event = BurnEvent.load(eventId)

  if (event == null) {
    event = new BurnEvent(eventId)
  }

  return event as BurnEvent
}

function getOrCreateWithdrawEvent(eventId: String): WithdrawEvent {
  let event = WithdrawEvent.load(eventId)

  if (event == null) {
    event = new WithdrawEvent(eventId)
  }

  return event as WithdrawEvent
}

function getOrCreateDepositEvent(eventId: String): DepositEvent {
  let event = DepositEvent.load(eventId)

  if (event == null) {
    event = new DepositEvent(eventId)
  }

  return event as DepositEvent
}

function getOrCreateAsset(tokenAddress: Address, persist: boolean = true): Asset {
  let addressString = tokenAddress.toHexString()

  let token = Asset.load(addressString)

  if (token == null) {
    token = new Asset(addressString)

    if (tokenAddress == GENESIS_ADDRESS) {
      token.address = null
      token.decimals = 0
      token.name = 'Unknown Asset'
      token.symbol = ''
    } else {
      token.address = tokenAddress

      let erc20Token = ERC20.bind(tokenAddress)

      let tokenDecimals = erc20Token.try_decimals()
      let tokenName = erc20Token.try_name()
      let tokenSymbol = erc20Token.try_symbol()

      token.decimals = !tokenDecimals.reverted ? tokenDecimals.value : DEFAULT_DECIMALS
      token.name = !tokenName.reverted ? tokenName.value : ''
      token.symbol = !tokenSymbol.reverted ? tokenSymbol.value : ''

      // Handle Single-Collateral Dai manually since isn't a detailed token
      if (token.address.toHexString() == '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359') {
        token.decimals = 18
        token.name = 'Sai Stablecoin v1.0'
        token.symbol = 'SAI'
      }
    }

    if (persist) {
      token.save()
    }
  }

  return token as Asset
}

function getTokenAddressFromPortfolioId(portfolioId: String): Address {
  let daiIds = new Array<string>(7)
  daiIds.push('0x810522b60dd90f9263d4e301357c9db1e75e63e814939ae109ccb964c96a93d3')
  daiIds.push('0x5511fa880353535668e2ba60b8800f49aecb527b143c19b933173d617dc4aea6')
  daiIds.push('0xea493a2b306e3c3f7548c41cac3b9d360cb7d46e1563bd9346f7e398d03e45fd')
  daiIds.push('0x5eea78fbdb7992da6f036e65ddb403b29aa15ba18be856f1e0ede3b1657d9b02')
  daiIds.push('0xcd55522e8f4c89017906f06cb11574a4cb79176b18a2a208e08780d079453c79')
  daiIds.push('0xb1608d113051804915ffc8db1ec8ff5fb579cfa976c18072715b2b3a6827f9af')
  daiIds.push('0xaf723346279a6d14268ec81e79c0d93c083bc40184fa2a463da0da48a9a4d19b')
  daiIds.push('0xd3ca7dda70d2cee4011f7785c5b4ed158c22a2475d22fa9484cb37137fe5bf11')

  let wethIds = new Array<string>(7)
  wethIds.push('0xbe72e724d4b9326428f7faca782d2dcc9e3e10824e8cf48a6499f23d695fd018')
  wethIds.push('0x89bdc287eca0056552bd2979865efb44e5f19fdc962accefb49f7eefc0e55ea9')
  wethIds.push('0xe1d9f3a90e5d350eec05cd47282029fcf71c7c09c29c032f198eeffc936975b6')
  wethIds.push('0xf26c69dbf25f9fb2bf793e4847f7c619cbc3323cb4ff988fb0ce4c5ea45affa1')
  wethIds.push('0x21590982edcc6d2c9b986dd8174fda53c28d1a919c8bf9b58ead7d441b306439')
  wethIds.push('0x5870955881b5219ec3d880e8ad25206c312127210a5695618971c47541982994')
  wethIds.push('0xa49d129cd260862e8226f232c7d2ab0dd7302e2bcb49847810392625b7dbf3f6')

  let saiIds = new Array<string>(7)
  saiIds.push('0x87e3990b15e1e64e3a17b0e4ebfcc4c03cc5ec64a33b442ae01ef15d9dadb575')
  saiIds.push('0xe51a4786828f3cbbdd643cd0d415c0f45bdbf7ec739dbdb2e64d6ac97bf103f1')
  saiIds.push('0xae52c5b4d809b421d746d3a7bde807ea6ec242ae13ae1b2bc6434493acf26d8b')
  saiIds.push('0xd33be800bb630e1ae95562a75be01b1b77a96386f99b3faa97a828b28c92dbb9')
  saiIds.push('0x165de3655459c6088f957bdb2877779c94aa17af570340349630726914a826fa')
  saiIds.push('0xcd93cf275bcc8c600887dc587ea0a16e8f0a87fa7f99560f72186069c8d3b3df')
  saiIds.push('0xf21acfdd065ab7839f3b0c66c441c6366b2240db1c3fa7c7da134c9be316fcd0')

  let usdcIds = new Array<string>(7)
  usdcIds.push('0x7c80b0e3ce0d2cabe1a3dfc888fca469bab09beccc3496f88cba8613d159a65b')
  usdcIds.push('0x1e868d302424cfebaf2b757c06fdd1a32411fd445ebb51ffc433cc15bacfe3e3')
  usdcIds.push('0x978274153eec4f3c072b45a6268ae86c0e61033c7a817328b407954972369b1d')
  usdcIds.push('0xf904b00f34beab1e77301f192a7fe866c4936fb9ea30e65543df5dc2d9176c69')
  usdcIds.push('0xb6cb9e19cd1b048a65dffcccc3a071c8d2d89ad070a0dca6f7efdf4ee7ab9e51')
  usdcIds.push('0x839de554365a548fbb6bf9b32952a781e00390bb8454a2bb8f4f3bbed40bc92c')
  usdcIds.push('0x4672ce0a5532a592a953596e6c19fc1cb1bd89cdaf2f6d6b4c71d5f8b6f7f58a')

  if (daiIds.includes(portfolioId)) {
    return DAI_ADDRESS
  } else if (saiIds.includes(portfolioId)) {
    return SAI_ADDRESS
  } else if (usdcIds.includes(portfolioId)) {
    return USDC_ADDRESS
  } else if (wethIds.includes(portfolioId)) {
    return WETH_ADDRESS
  } else {
    log.warning('Portfolio with id {} was not found in the portfolioId List', [portfolioId])
    return GENESIS_ADDRESS
  }
}

export {
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
  getOrCreateOpportunity,
}
