import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import {
  normalizeMarketResponse,
  formatBrl,
  formatUsd,
  formatCompactBrl,
  formatChange,
} from '../market.ts'
import type { TickerCoin } from '../../config/tickerCoins.ts'

const COINS: TickerCoin[] = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', image: 'https://x/btc.png', url: 'https://x/btc' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', image: 'https://x/eth.png', url: 'https://x/eth' },
]

const RAW = {
  ethereum: { brl: 12744.1, usd: 2494.29, brl_24h_change: 4.61, brl_market_cap: 1.55e12, last_updated_at: 1788454440 },
  bitcoin: { brl: 413710, usd: 80972, brl_24h_change: 4.98, brl_market_cap: 8.3e12, last_updated_at: 1788454440 },
}

describe('normalizeMarketResponse', () => {
  test('preserva a ordem do config, não a da resposta', () => {
    const out = normalizeMarketResponse(RAW, COINS)
    assert.deepEqual(out.map((c) => c.symbol), ['BTC', 'ETH'])
  })

  test('mapeia os campos e converte last_updated_at para ms', () => {
    const [btc] = normalizeMarketResponse(RAW, COINS)
    assert.equal(btc.priceBrl, 413710)
    assert.equal(btc.priceUsd, 80972)
    assert.equal(btc.change24h, 4.98)
    assert.equal(btc.marketCapBrl, 8.3e12)
    assert.equal(btc.updatedAt, 1788454440000)
    assert.equal(btc.name, 'Bitcoin')
    assert.equal(btc.url, 'https://x/btc')
  })

  test('descarta moeda ausente na resposta sem derrubar as outras', () => {
    const out = normalizeMarketResponse({ bitcoin: RAW.bitcoin }, COINS)
    assert.deepEqual(out.map((c) => c.symbol), ['BTC'])
  })

  test('descarta moeda com campo não numérico', () => {
    const raw = { ...RAW, ethereum: { ...RAW.ethereum, brl: 'n/a' } }
    const out = normalizeMarketResponse(raw, COINS)
    assert.deepEqual(out.map((c) => c.symbol), ['BTC'])
  })

  test('resposta vazia, nula ou não-objeto devolve []', () => {
    assert.deepEqual(normalizeMarketResponse({}, COINS), [])
    assert.deepEqual(normalizeMarketResponse(null, COINS), [])
    assert.deepEqual(normalizeMarketResponse('erro', COINS), [])
  })
})

describe('formatadores pt-BR', () => {
  test('formatBrl: sem centavos acima de 1000, 2 casas entre 1 e 1000, até 4 abaixo de 1', () => {
    assert.equal(formatBrl(413710), 'R$ 413.710')
    assert.equal(formatBrl(12744.1), 'R$ 12.744')
    assert.equal(formatBrl(12.5), 'R$ 12,50')
    assert.equal(formatBrl(0.0834), 'R$ 0,0834')
    assert.equal(formatBrl(0.5), 'R$ 0,50')
  })

  test('formatUsd segue a mesma regra com US$', () => {
    assert.equal(formatUsd(80972), 'US$ 80.972')
    assert.equal(formatUsd(2494.29), 'US$ 2.494')
    assert.equal(formatUsd(0.99), 'US$ 0,99')
  })

  test('formatCompactBrl usa mil/mi/bi/tri', () => {
    assert.equal(formatCompactBrl(8.3e12), 'R$ 8,3 tri')
    assert.equal(formatCompactBrl(312797415618), 'R$ 313 bi')
    assert.equal(formatCompactBrl(61e9), 'R$ 61 bi')
    assert.equal(formatCompactBrl(950e6), 'R$ 950 mi')
  })

  test('formatChange tem sinal e 2 casas', () => {
    assert.equal(formatChange(4.98), '+4,98%')
    assert.equal(formatChange(-0.3), '-0,30%')
    assert.equal(formatChange(0), '+0,00%')
  })
})
