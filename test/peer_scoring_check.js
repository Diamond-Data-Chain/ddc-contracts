const {
  PeerScoring,
  eclipseDefenseCheck,
} = require("../prototype/real-node/peer_scoring");

function must(name, ok) {
  if (!ok) throw new Error(`FAIL: ${name}`);
  console.log(`OK: ${name}`);
}

console.log("=== PEER SCORING CHECK ===");

const ps = new PeerScoring({
  maxMessagesPerWindow: 3,
  banScore: 30,
});

const good = ps.acceptMessage("peer-good", {
  id: "m1",
  type: "PROPOSAL",
}, 1);

must("valid peer message accepted", good.accepted === true);
must("good peer not banned", ps.isBanned("peer-good") === false);

const dup1 = ps.acceptMessage("peer-dup", { id: "x1", type: "PREVOTE" }, 1);
const dup2 = ps.acceptMessage("peer-dup", { id: "x1", type: "PREVOTE" }, 2);

must("first duplicate-source message accepted", dup1.accepted === true);
must("duplicate message rejected", dup2.accepted === false && dup2.reason === "duplicate message");

let invalid;
for (let i = 0; i < 4; i++) {
  invalid = ps.acceptMessage("peer-invalid", { id: `bad-${i}` }, i + 1);
}

must("invalid peer gets banned", ps.isBanned("peer-invalid") === true);

const spamPeer = "peer-spam";
ps.acceptMessage(spamPeer, { id: "s1", type: "PREVOTE" }, 100);
ps.acceptMessage(spamPeer, { id: "s2", type: "PREVOTE" }, 101);
ps.acceptMessage(spamPeer, { id: "s3", type: "PREVOTE" }, 102);
const spam = ps.acceptMessage(spamPeer, { id: "s4", type: "PREVOTE" }, 103);

must("spam peer rate limited", spam.accepted === false && spam.reason === "rate limit exceeded");

const stale = ps.acceptMessage("peer-stale", {
  id: "old-1",
  type: "PRECOMMIT",
  stale: true,
}, 200);

must("stale message rejected", stale.accepted === false && stale.reason === "stale message");

const eclipseBad = eclipseDefenseCheck([
  { peerId: "p1", group: "asn-A", banned: false },
  { peerId: "p2", group: "asn-A", banned: false },
  { peerId: "p3", group: "asn-A", banned: false },
], 3);

must("eclipse risk detected with single peer group", eclipseBad.defended === false);

const eclipseGood = eclipseDefenseCheck([
  { peerId: "p1", group: "asn-A", banned: false },
  { peerId: "p2", group: "asn-B", banned: false },
  { peerId: "p3", group: "asn-C", banned: false },
], 3);

must("peer diversity defends eclipse attempt", eclipseGood.defended === true);

console.log("PEER SCORING CHECK PASSED");
