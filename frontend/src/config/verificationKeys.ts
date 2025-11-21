// Groth16 Verification Key Components
// Generated from circuits/vk_components.json
// These are used for on-chain proof verification

// Helper function to convert hex string to byte array
export function hexToBytes(hex: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

// Verification key component 1: IC array for public inputs
// Length: 192 bytes (3 G1 points: base + 2 public inputs)
export const VK_GAMMA_ABC_G1_HEX = "28c0a0bd10a78b77800f12f2cc20f7a1023ebac332f05cd324b362576a474b262a30d066418b9291aed7015e79edb0bedaaf4611d6d440facfae311a761b51f5226cbc2437913f351113c4cd7aa1b02286dabbfac9b0277eec3991d4576617ed1fc2d63fe201442f143ff7a16537e976e12e23a3c37f611a8674f56f0c557922089b150cc1fe4ea2c1ed905fa6ac3279808067fd2a94d62e0e006921b436dcf815b9645b78dd93d9caeb7e958da07a23a7263cd6def017d9df276ae06ddd91a8";

// Verification key component 2: Pairing result (alpha * beta)
// Length: 384 bytes (Fq12 element)
export const VK_ALPHA_G1_BETA_G2_HEX = "1d2c6d90e83ebedd50dd18e9aad4f7e0aecdd35329cc0c4bccc4c7c923a26fe116a90cd4268a9219a9fd2edbeb3d5a3ef62de1e2d6d993d2d29956386dca5075293f8c2ea380e6ad29962e8428b506b08776e8ead48e4a34e85dbfd44c4b83f01c5788b47ef959de41f759976ae04f9ae4e386b19579769fc3aa1b4e1d9e46c92ee84af4c31d0646e958c24dcbac41ec4174f879eba6a5e2e4195acd164dd11328a20e8fd086eb6570499156729238cc48678220e7fb03f19eba3ec844b687f401093d03f32aceef3ac2d575afe20bf165822aa697ac539135dc9e6f52efe06824319674d48678e82ca30042ac2ef072fd5454df1fd1dc36b16cf0ca57feb92404bd9668884026c441f2645257a860d434b2e4105f506deef326d8315af3bc7a0a1639362c5f21bdb3b958468abe54162beedb0037d2908b8249dcef1665dca501e18177bcbbddcc3a38538f9a9207218a13fcc2a13858e7f6abfc632d86b6cb3032177531dd92444df2d19517da52cf3ba8cd394ce4464f5fe100a7cb04eee1";

// Verification key component 3: Gamma G2 point (negated, precomputed)
// Length: 128 bytes (G2 point)
export const VK_GAMMA_G2_NEG_PC_HEX = "1800deef121f1e76426a00665e5c4479674322d4f75edadd46debd5cd992f6ed198e9393920d483a7260bfb731fb5d25f1aa493335a9e71297e485b7aef312c212c85ea5db8c6deb4aab71808dcb408fe3d1e7690c43d37b4ce6cc0166fa7daa090689d0585ff075ec9e99ad690c3395bc4b313370b38ef355acdadcd122975b";

// Verification key component 4: Delta G2 point (negated, precomputed)
// Length: 128 bytes (G2 point)
export const VK_DELTA_G2_NEG_PC_HEX = "18bb47a0c30342d980050511120bb7c8b932fab03d38da2dc343e750f3ca5ac32e92cb273eb8178762b9c39afe16652b9b57762537138a62450f92bc6e44cc410b1f72e46f75ad40539ce4059ff22f0a58ad0b2b76783ffcb1d1358a87dc57360082a701d3d94d4082df35c9635ab8dd3388614c88a6b2ae0d8bd53279c167e9";

// Convert all components to byte arrays (computed at import time)
export const VK_GAMMA_ABC_G1 = hexToBytes(VK_GAMMA_ABC_G1_HEX);
export const VK_ALPHA_G1_BETA_G2 = hexToBytes(VK_ALPHA_G1_BETA_G2_HEX);
export const VK_GAMMA_G2_NEG_PC = hexToBytes(VK_GAMMA_G2_NEG_PC_HEX);
export const VK_DELTA_G2_NEG_PC = hexToBytes(VK_DELTA_G2_NEG_PC_HEX);

// Verification key info for display
export const VK_INFO = {
    protocol: "groth16",
    curve: "bn128",
    nPublic: 2,
    setupParameter: 8,
    security: "Testing only (parameter 8)",
    totalSize: VK_GAMMA_ABC_G1.length + VK_ALPHA_G1_BETA_G2.length + VK_GAMMA_G2_NEG_PC.length + VK_DELTA_G2_NEG_PC.length,
    components: {
        vk_gamma_abc_g1: VK_GAMMA_ABC_G1.length,
        vk_alpha_g1_beta_g2: VK_ALPHA_G1_BETA_G2.length,
        vk_gamma_g2_neg_pc: VK_GAMMA_G2_NEG_PC.length,
        vk_delta_g2_neg_pc: VK_DELTA_G2_NEG_PC.length,
    }
};
