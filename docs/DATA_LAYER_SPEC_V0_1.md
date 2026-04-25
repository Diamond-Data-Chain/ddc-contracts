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
