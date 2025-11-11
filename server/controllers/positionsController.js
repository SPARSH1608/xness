const prisma = require('../prismaClient');
const redis = require('../redisClient');
const {Kafka} =require('kafkajs')
const kafkaClient=new Kafka({
  clientId: 'positions',
   brokers: ["localhost:9092"],
})
const kafkaProducer = kafkaClient.producer();
// POST /positions/long

async function createLongPosition(req, res) {
  const userId = Number(req.user.userId);
  const { asset, leverage = 1, quantity, stopLoss, takeProfit } = req.body; 

  try {
    const priceStr = await redis.get(`price:${asset}`);
    if (!priceStr) return res.status(500).json({ error: "Price unavailable" });
    const price = parseFloat(priceStr);

    if (!quantity) return res.status(400).json({ error: "Quantity is required" });
    const finalQuantity = parseFloat(quantity);
    if (isNaN(finalQuantity) || finalQuantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const finalLeverage = parseInt(leverage) || 1;
    if (finalLeverage < 1) {
      return res.status(400).json({ error: "Invalid leverage" });
    }

    const finalMargin = (finalQuantity * price) / finalLeverage;
    const fee = price * 0.01 * finalQuantity; // 1% fee on notional

    const position = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { userId } });
      if (!user) throw new Error("User not found");
      console.log('balances in backend while creating long', user.balance, finalMargin * finalLeverage + fee);
      if (user.balance < finalMargin * finalLeverage + fee) throw new Error("Insufficient balance");

      await tx.user.update({
        where: { userId },
        data: { balance: { decrement: finalMargin + fee } },
      });

      return tx.position.create({
        data: {
          userId,
          asset,
          quantity: finalQuantity,
          margin: finalMargin,
          leverage: finalLeverage,
          boughtPrice: price,
          type: "long",
          status: "open",
          fee,
          stopLoss: stopLoss ? Number(stopLoss) : null,       
          takeProfit: takeProfit ? Number(takeProfit) : null, 
        },
      });
    });
    await kafkaProducer.connect().catch(console.error);
    await kafkaProducer.send({
      topic: 'open-positions',
      messages: [
        { key: String(position.positionId), value: JSON.stringify({ positionId: position.positionId }) }
      ]
    });
    console.log('passed to kafka',position)
    res.json(position);
  } catch (err) {
    res.status(400).json({ error: err.message || "Order failed" });
  }
}

// GET /positions/my
async function getUserPositions(req, res) {
  const userId = Number(req.user.userId);
  try {
    const positions = await prisma.position.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({ positions });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch positions" });
  }
}

async function closePosition(req, res) {
  const userId = Number(req.user.userId);
  const { positionId } = req.body;
  if (!positionId) return res.status(400).json({ error: "Position ID required" });

  try {
    // Fetch position
    const pos = await prisma.position.findUnique({ where: { positionId: Number(positionId) } });
    if (!pos) return res.status(404).json({ error: "Position not found" });
    if (pos.userId !== userId) return res.status(403).json({ error: "Forbidden" });
    if (pos.status !== "open") return res.status(400).json({ error: "Position not open" });
console.log('position',pos)
    // Get current price from Redis
    const priceStr = await redis.get(`price:${pos.asset}`);
    if (!priceStr) return res.status(500).json({ error: "Price unavailable" });
    const currentPrice = parseFloat(priceStr);

    // Calculate 1% fee
    const fee = currentPrice * 0.01;
    const effectivePrice = currentPrice - fee;

    // Leverage
    const lev = Number(pos.leverage) || 1;

    // PnL calculation
    const pnl = (effectivePrice - Number(pos.boughtPrice)) * Number(pos.quantity) * lev;

    // Return margin + PnL to user
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { userId },
        data: { balance: { increment: pos.margin + pnl } },
      });
      await tx.position.update({
        where: { positionId: pos.positionId },
        data: { status: "closed", closedPrice: currentPrice, closedAt: new Date() },
      });
    });

    // Remove from Kafka (send tombstone)
    await kafkaProducer.connect().catch(console.error);
    await kafkaProducer.send({
      topic: 'open-positions',
      messages: [
        { key: String(pos.positionId), value: null }
      ]
    });

    res.json({ success: true, pnl, closedPrice: currentPrice });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to close position" });
  }
}

// POST /positions/createShort
async function createShortPosition(req, res) {
  const userId = Number(req.user.userId);
  const { asset, leverage = 1, quantity, stopLoss, takeProfit } = req.body; // <-- add stopLoss, takeProfit

  try {
    const priceStr = await redis.get(`price:${asset}`);
    if (!priceStr) return res.status(500).json({ error: "Price unavailable" });
    const price = parseFloat(priceStr);

    if (!quantity) return res.status(400).json({ error: "Quantity is required" });
    const finalQuantity = parseFloat(quantity);
    if (isNaN(finalQuantity) || finalQuantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    const finalLeverage = parseInt(leverage) || 1;
    if (finalLeverage < 1) {
      return res.status(400).json({ error: "Invalid leverage" });
    }

    const finalMargin = (finalQuantity * price) / finalLeverage;
    const fee = price * 0.01 * finalQuantity; // 1% fee on notional

    const position = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { userId } });
      if (!user) throw new Error("User not found");
      if (user.balance < finalMargin * finalLeverage + fee) throw new Error("Insufficient balance");

      await tx.user.update({
        where: { userId },
        data: { balance: { decrement: finalMargin + fee } },
      });

      return tx.position.create({
        data: {
          userId,
          asset,
          quantity: finalQuantity,
          margin: finalMargin,
          leverage: finalLeverage,
          boughtPrice: price,
          type: "short",
          status: "open",
          fee,
          stopLoss: stopLoss ? Number(stopLoss) : null,       // <-- add
          takeProfit: takeProfit ? Number(takeProfit) : null, // <-- add
        },
      });
    });
    await kafkaProducer.connect().catch(console.error);
await kafkaProducer.send({
  topic: 'open-positions',
  messages: [
    { key: String(position.positionId), value: JSON.stringify({ positionId: position.positionId }) }
  ]
});
    res.json(position);
  } catch (err) {
    res.status(400).json({ error: err.message || "Order failed" });
  }
}

// POST /positions/closeShort
async function closeShortPosition(req, res) {
  const userId = Number(req.user.userId);
  const { positionId } = req.body;
  if (!positionId) return res.status(400).json({ error: "Position ID required" });

  try {
    const pos = await prisma.position.findUnique({ where: { positionId: Number(positionId) } });
    if (!pos) return res.status(404).json({ error: "Position not found" });
    if (pos.userId !== userId) return res.status(403).json({ error: "Forbidden" });
    if (pos.status !== "open") return res.status(400).json({ error: "Position not open" });
    if (pos.type !== "short") return res.status(400).json({ error: "Not a short position" });

    const priceStr = await redis.get(`price:${pos.asset}`);
    if (!priceStr) return res.status(500).json({ error: "Price unavailable" });
    const currentPrice = parseFloat(priceStr);

    // 1% fee
    const fee = currentPrice * 0.01;
    const effectivePrice = currentPrice - fee;

    const lev = Number(pos.leverage) || 1;

    // Short PnL: (entry - current) * qty * lev
    const pnl = (Number(pos.boughtPrice) - effectivePrice) * Number(pos.quantity) * lev;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { userId },
        data: { balance: { increment: pos.margin + pnl } },
      });
      await tx.position.update({
        where: { positionId: pos.positionId },
        data: { status: "closed", closedPrice: currentPrice, closedAt: new Date() },
      });
    });

    // Remove from Kafka (send tombstone)
    await kafkaProducer.connect().catch(console.error);
    await kafkaProducer.send({
      topic: 'open-positions',
      messages: [
        { key: String(pos.positionId), value: null }
      ]
    });

    res.json({ success: true, pnl, closedPrice: currentPrice });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to close position" });
  }
}

module.exports = {
  createLongPosition,
  getUserPositions,
  closePosition,
  createShortPosition,
  closeShortPosition,
};
