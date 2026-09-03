import { test } from 'node:test'
import assert from 'node:assert/strict'
import { TICKER_COINS } from '../../config/tickerCoins.ts'

test('tem 10 moedas com ids únicos', () => {
  assert.equal(TICKER_COINS.length, 10)
  assert.equal(new Set(TICKER_COINS.map((c) => c.id)).size, 10)
})

test('símbolos em maiúsculas e sem stablecoin', () => {
  for (const c of TICKER_COINS) {
    assert.equal(c.symbol, c.symbol.toUpperCase())
    assert.ok(!['USDT', 'USDC', 'DAI'].includes(c.symbol), `${c.symbol} é stablecoin`)
  }
})

test('imagem e url em https nos hosts esperados', () => {
  for (const c of TICKER_COINS) {
    assert.ok(c.image.startsWith('https://coin-images.coingecko.com/'), c.image)
    assert.equal(c.url, `https://www.coingecko.com/pt-br/moedas/${c.id}`)
  }
})
