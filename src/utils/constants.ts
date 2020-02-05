import { BigInt, BigDecimal, Address } from '@graphprotocol/graph-ts'

let ZERO = BigInt.fromI32(0)
let ZERO_DECIMAL = new BigDecimal(ZERO)

let DAI_ADDRESS = Address.fromString('0x6b175474e89094c44da98b954eedeac495271d0f')
let SAI_ADDRESS = Address.fromString('0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359')
let WETH_ADDRESS = Address.fromString('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
let USDC_ADDRESS = Address.fromString('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
let GENESIS_ADDRESS = Address.fromString('0x0000000000000000000000000000000000000000')

export { DAI_ADDRESS, SAI_ADDRESS, WETH_ADDRESS, USDC_ADDRESS, GENESIS_ADDRESS, ZERO, ZERO_DECIMAL }
