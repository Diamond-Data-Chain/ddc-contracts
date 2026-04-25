# DDC Data Layer Specification v0.1

Status: Design specification, not implemented as production node software.

## Core Principle

DDC must not treat every submitted statement as truth.

A data record can exist in multiple states:

- submitted
- recorded
- challenged
- verified
- rejected
- revoked

"Recorded" does not mean "true".

## Data Object

Every data object must include:

- datasetId
- submitter address / identity
- content hash
- metadata hash
- timestamp
- source reference
- license / access metadata
- validation status
- validator attestations
- dispute status

Raw data should not be stored directly on-chain unless explicitly required.
The chain stores hashes, metadata references, proofs and validation state.

## Submitter Rules

A submitter may register a data object only if they provide:

- source claim
- content hash
- metadata hash
- declaration of rights / authority
- signature from submitter key

TODO(WP):
- define KYC / identity requirements if needed
- define who may submit public datasets
- define private/commercial dataset onboarding

## Validation Model

Data validity must be established through validator attestations.

A validator does not simply confirm that data exists.
A validator confirms one or more of:

- source consistency
- hash integrity
- format compliance
- schema compliance
- timestamp plausibility
- license/access metadata consistency
- duplicate detection
- anomaly detection
- challenge review result

## Truth Levels

DDC data layer uses truth levels:

### Level 0 — Submitted

Data was submitted but not validated.

### Level 1 — Recorded

Data hash and metadata were recorded.

### Level 2 — Format Verified

Data matches required schema and hash rules.

### Level 3 — Source Verified

Data source or submitter authority was checked.

### Level 4 — Validator Verified

Enough validators attested to validity.

### Level 5 — Dispute-Resistant

Challenge period passed or disputes were resolved.

## Invalid Data Example

If a user submits:

"snow is black"

DDC must not mark it as true only because it was submitted.

The record may be stored as submitted/recorded, but it must not become verified unless validators confirm the claim under defined rules.

## Challenge System

Any verified record may be challenged.

A challenge must include:

- challenged datasetId
- reason code
- counter-evidence hash
- challenger signature
- optional stake/bond

Possible outcomes:

- challenge rejected
- record downgraded
- record rejected
- submitter penalized
- validator reputation adjusted

TODO(WP):
- challenge window
- challenge bond
- validator review process
- slashing/reputation penalties

## Validator Reputation

Validators accumulate reputation based on:

- correct attestations
- rejected false data
- confirmed challenge outcomes
- uptime / participation
- consistency with final decisions

Validators lose reputation for:

- approving false data
- rejecting valid data maliciously
- inconsistent attestations
- failure to participate
- collusion

## AI Role

AI may assist validation by:

- detecting anomalies
- detecting duplicates
- checking schema consistency
- flagging suspicious claims
- suggesting risk scores

AI must not be the final authority.

Final validation requires protocol-defined validator attestations.

## Data Finality

A data record becomes verified only after:

- required validation rules pass
- sufficient validator attestations exist
- challenge period rules are satisfied

TODO(WP):
- exact validator threshold
- whether DDC-256 branch model also applies to data validation
- finality delay
- dispute escalation process

## DDT Relationship

DDT may represent:

- dataset reference
- access metadata
- provenance object
- license/access right

DDT must not automatically imply that the dataset is true.

DDT validity depends on the data object's validation state.

## Public Disclosure Rule

Correct wording:

"DDC data layer will distinguish submitted data from verified data."

Incorrect wording:

"All data written to DDC is automatically true."

## Who Verifies Data

Data verification is performed by multiple independent actors, not by the submitter alone.

Verification participants may include:

1. Protocol validators
2. Domain validators
3. Source authorities
4. Challengers
5. AI-assisted anomaly detectors

No single actor can unilaterally mark data as final truth.

## Validator Types

### Protocol Validators

Protocol validators verify technical correctness:

- hash integrity
- schema compliance
- timestamp consistency
- signature validity
- duplicate detection
- metadata completeness

### Domain Validators

Domain validators verify subject-matter plausibility.

Examples:
- climate data validators
- medical data validators
- logistics validators
- legal document validators
- scientific dataset validators

TODO(WP):
- define domain validator onboarding
- define domain validator qualification requirements
- define domain-specific validation rules

### Source Authorities

Source authorities are trusted origin references.

Examples:
- government registers
- certified sensors
- licensed institutions
- signed enterprise systems
- verified data providers

A source authority does not automatically make data true, but it increases verification weight.

### Challengers

Any eligible participant may challenge a verified or pending data object by submitting counter-evidence.

Challenges prevent false records from becoming permanently trusted without review.

### AI-Assisted Checks

AI may assist with:

- anomaly detection
- duplicate detection
- conflict detection
- risk scoring
- consistency checks

AI is advisory only and cannot finalize truth alone.

## How Accuracy Is Checked

Accuracy is checked through layered verification.

### Layer 1 — Cryptographic Verification

Checks:
- submitter signature
- content hash
- metadata hash
- timestamp
- datasetId consistency

Purpose:
prove that the submitted record was not altered.

### Layer 2 — Schema Verification

Checks:
- required fields
- valid data type
- valid format
- required metadata
- license/access fields

Purpose:
prove that the data follows protocol rules.

### Layer 3 — Source Verification

Checks:
- does the claimed source exist?
- is the submitter authorized?
- does the source signature match?
- does the source timestamp match?

Purpose:
prove that the data came from a valid origin.

### Layer 4 — Cross-Reference Verification

Checks:
- compare with independent sources
- compare with historical values
- compare with known ranges
- detect contradictions

Purpose:
detect false or suspicious claims.

### Layer 5 — Validator Attestation

Multiple validators attest to the record.

A record becomes validator-verified only when the required validator threshold is reached.

TODO(WP):
- define exact threshold
- define validator weighting
- define whether DDC-256 branch threshold applies to data validation
- define minimum domain-validator quorum

### Layer 6 — Challenge Period

Even after validator attestation, the record may remain challengeable for a defined period.

If no valid challenge succeeds, the record may move to a higher trust level.

## Important Rule

DDC verifies evidence, provenance and validator consensus.

DDC must not claim to prove absolute truth in every real-world situation.

Correct claim:
"DDC provides verifiable provenance, validation state and dispute history."

Incorrect claim:
"DDC guarantees that all recorded data is objectively true."


## Data Submitter Types

DDC data layer supports multiple submitter types. Each type has different trust assumptions and validation requirements.

### 1. Human Submitter

A human may submit data manually.

Requirements may include:
- wallet signature
- KYC / verified identity
- declaration of data source
- evidence attachment
- liability / terms acceptance

Use cases:
- legal documents
- business records
- manual reports
- research submissions

Trust level:
- low by default
- increases with KYC, history, reputation and validator confirmation

### 2. Verified Organization

A company, institution or public authority may submit data.

Requirements may include:
- organization verification
- authorized signer wallet
- legal entity metadata
- source documentation
- audit trail

Use cases:
- industry records
- supply-chain data
- compliance reports
- government or registry data

Trust level:
- medium/high depending on verification and reputation

### 3. Machine / Device Submitter

A machine, QR scanner, IoT device, sensor or industrial system may submit data.

Requirements may include:
- registered device identity
- device public key
- signed payload
- timestamp
- location or environment metadata
- calibration / certification metadata

Use cases:
- QR-code scanning
- factory events
- logistics tracking
- sensor data
- equipment status

Trust level:
- depends on device certification, tamper resistance and data consistency

### 4. QR / Barcode / NFC Reader

A scanner may submit event data when reading QR, barcode, RFID or NFC tags.

Example event:
- product scanned
- package moved
- component verified
- certificate checked
- access event recorded

Required fields:
- scanner identity
- scanned object identifier
- timestamp
- location metadata if allowed
- operator identity if required
- signed scan event

Important:
A scan proves that a code/tag was read.
It does not automatically prove that the physical object is genuine unless additional validation exists.

### 5. On-Chain Submitter

Another blockchain contract, wallet or oracle may submit data.

Requirements may include:
- source chain id
- source contract address
- transaction hash
- block number
- proof/reference
- bridge/oracle attestation if cross-chain

Use cases:
- crypto transactions
- token ownership proofs
- DeFi events
- NFT/data ownership references
- cross-chain records

Trust level:
- depends on source chain finality and bridge/oracle trust model

### 6. Oracle / API Submitter

An oracle or API provider may submit external-world data.

Requirements may include:
- oracle identity
- signed response
- source URL/reference hash
- timestamp
- aggregation proof if multiple sources are used

Use cases:
- price data
- weather data
- market data
- public statistics
- external registries

Trust level:
- medium, unless backed by multiple independent sources

### 7. AI-Assisted Submitter

AI may prepare or classify data for submission, but must not be treated as final authority.

Requirements:
- human/system owner signature
- model/version metadata
- input/output hash
- confidence score
- audit trail

Use cases:
- classification
- anomaly reports
- document extraction
- metadata generation

Trust level:
- advisory only until validator-confirmed

## Context-Specific Validation

DDC must not validate all data the same way.

### Industrial Data

Requires:
- device identity
- operator identity where relevant
- timestamp
- production-line or facility metadata
- calibration/certification proof
- anomaly detection
- domain validator review for critical events

### Crypto / On-Chain Data

Requires:
- source chain
- transaction hash
- block confirmation depth
- contract address
- event signature
- proof or oracle attestation for cross-chain claims

### Legal / Compliance Data

Requires:
- verified submitter
- document hash
- signer identity
- jurisdiction metadata
- timestamp
- source authority if applicable

### Scientific / Research Data

Requires:
- dataset hash
- methodology reference
- author/institution identity
- reproducibility metadata
- peer/domain validation

### Supply Chain Data

Requires:
- item identifier
- scanner/device identity
- custody event type
- timestamp
- location metadata if allowed
- previous custody reference
- anomaly detection

## Submitter Trust Score

Each submitter may have a trust score based on:

- identity verification level
- historical accuracy
- successful challenges against them
- validator confirmations
- domain reputation
- device certification
- source authority status

A higher trust score may reduce review friction but must not bypass critical validation rules.

## Submission Rule

DDC must store the submitter type and validation path used for each data object.

A record should never be marked simply as "verified" without explaining:

- who submitted it
- what type of submitter they are
- which checks were performed
- which validators attested
- whether it was challenged
