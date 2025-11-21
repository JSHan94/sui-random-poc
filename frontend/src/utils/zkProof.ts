import * as snarkjs from 'snarkjs';

// Load the WASM witness calculator
async function loadWitnessCalculator() {
    const wasmPath = '/zkp/claim_js/claim.wasm';
    const response = await fetch(wasmPath);
    const wasmBuffer = await response.arrayBuffer();
    return wasmBuffer;
}

// Generate a Groth16 proof for prize claiming
export async function generateClaimProof(
    secret: bigint,
    nullifier: bigint,
    commitment: bigint,
    nullifierHash: bigint
): Promise<{
    proof_a: number[];
    proof_b: number[];
    proof_c: number[];
}> {
    try {
        console.log('Generating ZK proof...');
        console.log('Inputs:', {
            secret: secret.toString(),
            nullifier: nullifier.toString(),
            commitment: commitment.toString(),
            nullifierHash: nullifierHash.toString(),
        });

        // Load witness calculator WASM
        const wasmBuffer = await loadWitnessCalculator();

        // Load proving key
        const zkeyPath = '/zkp/claim_final.zkey';
        const zkeyResponse = await fetch(zkeyPath);
        const zkeyBuffer = await zkeyResponse.arrayBuffer();

        // Prepare circuit inputs
        const input = {
            secret: secret.toString(),
            nullifier: nullifier.toString(),
            commitment: commitment.toString(),
            nullifierHash: nullifierHash.toString(),
        };

        console.log('Generating witness...');
        // Generate witness
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            new Uint8Array(wasmBuffer),
            new Uint8Array(zkeyBuffer)
        );

        console.log('Proof generated:', proof);
        console.log('Public signals:', publicSignals);

        // Extract proof components
        // proof_a is a G1 point (2 coordinates, each 32 bytes)
        const proof_a = encodeG1Point(proof.pi_a);

        // proof_b is a G2 point (2 coordinates, each is 2 field elements of 32 bytes)
        const proof_b = encodeG2Point(proof.pi_b);

        // proof_c is a G1 point (2 coordinates, each 32 bytes)
        const proof_c = encodeG1Point(proof.pi_c);

        console.log('Encoded proof components:');
        console.log('proof_a:', proof_a.length, 'bytes');
        console.log('proof_b:', proof_b.length, 'bytes');
        console.log('proof_c:', proof_c.length, 'bytes');

        return {
            proof_a,
            proof_b,
            proof_c,
        };
    } catch (error) {
        console.error('Error generating proof:', error);
        throw error;
    }
}

// Encode G1 point (2 field elements of 32 bytes each = 64 bytes total)
function encodeG1Point(point: string[]): number[] {
    const bytes: number[] = [];

    // Encode x coordinate (32 bytes)
    const xBytes = bigIntToBytes32(BigInt(point[0]));
    bytes.push(...xBytes);

    // Encode y coordinate (32 bytes)
    const yBytes = bigIntToBytes32(BigInt(point[1]));
    bytes.push(...yBytes);

    return bytes;
}

// Encode G2 point (2 coordinates, each is 2 field elements of 32 bytes = 128 bytes total)
function encodeG2Point(point: string[][]): number[] {
    const bytes: number[] = [];

    // G2 point structure: [[x_c0, x_c1], [y_c0, y_c1]]
    // Encode x coordinate (64 bytes: x_c0 + x_c1)
    const x_c0_bytes = bigIntToBytes32(BigInt(point[0][0]));
    bytes.push(...x_c0_bytes);

    const x_c1_bytes = bigIntToBytes32(BigInt(point[0][1]));
    bytes.push(...x_c1_bytes);

    // Encode y coordinate (64 bytes: y_c0 + y_c1)
    const y_c0_bytes = bigIntToBytes32(BigInt(point[1][0]));
    bytes.push(...y_c0_bytes);

    const y_c1_bytes = bigIntToBytes32(BigInt(point[1][1]));
    bytes.push(...y_c1_bytes);

    return bytes;
}

// Convert a BigInt to a 32-byte array (little-endian for Sui groth16 module)
function bigIntToBytes32(value: bigint): number[] {
    const bytes: number[] = [];
    let v = value;

    // Convert to 32 bytes in little-endian format
    for (let i = 0; i < 32; i++) {
        bytes.push(Number(v & 0xFFn));
        v = v >> 8n;
    }

    return bytes;
}

// Test function to verify proof generation
export async function testProofGeneration() {
    const secret = 123456789n;
    const nullifier = 987654321n;

    const MAX_U64 = (1n << 64n) - 1n;
    const secretSquared = (secret * secret) & MAX_U64;
    const nullifierSquared = (nullifier * nullifier) & MAX_U64;
    const commitment = (secretSquared + nullifierSquared) & MAX_U64;
    const nullifierHash = nullifierSquared;

    console.log('Test inputs:', {
        secret: secret.toString(),
        nullifier: nullifier.toString(),
        commitment: commitment.toString(),
        nullifierHash: nullifierHash.toString(),
    });

    const proof = await generateClaimProof(secret, nullifier, commitment, nullifierHash);
    console.log('Test proof generated successfully:', proof);
}
