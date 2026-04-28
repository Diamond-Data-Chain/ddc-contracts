function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

function ddcOut(usdt6, price6) {
  return (BigInt(usdt6) * 10n ** 18n) / BigInt(price6);
}

console.log("=== PRESALE ECONOMIC MATH CHECK ===");

const prices = [
  10000n, 12500n, 15000n, 20000n, 25000n,
  30000n, 40000n, 50000n, 75000n, 100000n
];

for (const price of prices) {
  const lump = ddcOut(1000n * 10n ** 6n, price);

  let split = 0n;
  for (let i = 0; i < 1000; i++) {
    split += ddcOut(1n * 10n ** 6n, price);
  }

  must(`split purchase does not exceed lump at price ${price}`, split <= lump);
}

must("50 USDT min converts to positive DDC", ddcOut(50n * 10n ** 6n, 100000n) > 0n);
must("5000 USDT max converts to positive DDC", ddcOut(5000n * 10n ** 6n, 100000n) > 0n);

console.log("PRESALE ECONOMIC MATH CHECK PASSED");
