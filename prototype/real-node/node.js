#!/usr/bin/env node

const { v4: uuidv4 } = require("uuid");
const { createMessage } = require("./messages");
const { createState } = require("./state");

const NODE_ID = process.env.NODE_ID || `node-${Math.floor(Math.random() * 1000)}`;

const state = createState();

function log(msg, data = {}) {
  console.log(JSON.stringify({
    node: NODE_ID,
    msg,
    ...data
  }));
}

function start() {
  log("START");

  // simulate block proposal
  const block = {
    height: state.height + 1,
    txs: [],
    timestamp: new Date().toISOString(),
    proposer: NODE_ID
  };

  state.blocks.push(block);
  state.height++;

  log("BLOCK_PROPOSED", block);

  // simulate branch attestations
  const attestations = [];
  for (let i = 0; i < 256; i++) {
    const status = Math.random() > 0.2 ? "confirmed" : "rejected";
    attestations.push({
      branchId: i + 1,
      validator: `validator-${i}`,
      status
    });
  }

  const confirmed = attestations.filter(a => a.status === "confirmed").length;

  const finality = confirmed >= 172;

  log("FINALITY", {
    confirmed,
    finality
  });
}

start();
