import { useState, useEffect } from "react"

// Helper function to generate random 31-bit number
// We use 31 bits (not 64) to ensure secret^2 + nullifier^2 fits in u64
// This avoids overflow issues in the ZK circuit
const generateRandomU31 = (): bigint => {
	// Generate 4 random bytes (32 bits)
	const bytes = new Uint8Array(4)
	crypto.getRandomValues(bytes)
	// Convert to bigint
	let result = 0n
	for (let i = 0; i < 4; i++) {
		result = (result << 8n) | BigInt(bytes[i])
	}
	// Mask to 31 bits (max value: 2^31 - 1 = 2147483647)
	return result & ((1n << 31n) - 1n)
}

// Helper to compute commitment = secret^2 + nullifier^2
// No modulo operation - circuit computes in the field
const computeCommitment = (secret: bigint, nullifier: bigint): bigint => {
	const secretSquared = secret * secret
	const nullifierSquared = nullifier * nullifier
	return secretSquared + nullifierSquared
}

export const useSecret = () => {
	const [commitment, setCommitment] = useState<string>("") // Stores the commitment value
	const [walrusBlobId, setWalrusBlobId] = useState<string>("") // Kept for compatibility but not used
	const [generatedSecret, setGeneratedSecret] = useState<string>("") // Format: "secret,nullifier"
	const [isGeneratingSecret, setIsGeneratingSecret] = useState<boolean>(false)
	const [isRetrievingSecret, setIsRetrievingSecret] = useState<boolean>(false)
	const [status, setStatus] = useState<string>("")

	// Load secret from localStorage on mount
	useEffect(() => {
		const storedCommitment = localStorage.getItem("lotteryCommitment")
		const storedSecret = localStorage.getItem("lotterySecret")

		if (storedCommitment) setCommitment(storedCommitment)
		if (storedSecret) setGeneratedSecret(storedSecret)
	}, [])

	const handleGenerateAndUploadSecret = async () => {
		setIsGeneratingSecret(true)
		setStatus("Generating commitment...")

		try {
			// Generate random secret and nullifier (31-bit values)
			const secret = generateRandomU31()
			const nullifier = generateRandomU31()

			// Compute commitment = secret^2 + nullifier^2
			const computedCommitment = computeCommitment(secret, nullifier)

			// Store as "secret,nullifier" format
			const secretData = `${secret.toString()},${nullifier.toString()}`

			// Store the generated values in state and localStorage
			setGeneratedSecret(secretData)
			setCommitment(computedCommitment.toString())
			setWalrusBlobId("") // Not using Walrus for now

			// Persist to localStorage
			localStorage.setItem("lotterySecret", secretData)
			localStorage.setItem("lotteryCommitment", computedCommitment.toString())

			setStatus(
				`✅ Commitment generated!\n\nSecret: ${secret.toString()}\nNullifier: ${nullifier.toString()}\nCommitment: ${computedCommitment.toString()}\n\n💾 Saved to localStorage! You can now use this for all lottery picks.\n\n⚠️ IMPORTANT: Copy these values somewhere safe! If you lose them, you won't be able to claim prizes.`
			)
			setIsGeneratingSecret(false)
		} catch (error: any) {
			console.error("Error generating commitment:", error)
			setStatus(`Error: ${error.message}`)
			setIsGeneratingSecret(false)
		}
	}

	const handleRetrieveSecretFromWalrus = async (secretInput: string) => {
		const secretData = secretInput.trim()

		if (!secretData) {
			setStatus("Please enter your secret data (format: secret,nullifier)")
			return
		}

		setIsRetrievingSecret(true)
		setStatus("Loading secret...")

		try {
			// Parse secret and nullifier from input (format: "secret,nullifier")
			const [secretStr, nullifierStr] = secretData.split(',')

			if (!secretStr || !nullifierStr) {
				throw new Error("Invalid format. Please use: secret,nullifier")
			}

			const secret = BigInt(secretStr.trim())
			const nullifier = BigInt(nullifierStr.trim())

			// Compute commitment
			const computedCommitment = computeCommitment(secret, nullifier)

			setGeneratedSecret(secretData)
			setCommitment(computedCommitment.toString())
			setWalrusBlobId("")

			// Save to localStorage
			localStorage.setItem("lotterySecret", secretData)
			localStorage.setItem("lotteryCommitment", computedCommitment.toString())

			setStatus(
				`✅ Secret loaded!\nCommitment: ${computedCommitment.toString()}\n\nYou can now use this for lottery picks.`
			)
		} catch (error: any) {
			console.error("Error loading secret:", error)
			setStatus(`Error: ${error.message}`)
		} finally {
			setIsRetrievingSecret(false)
		}
	}

	return {
		commitment,
		walrusBlobId,
		generatedSecret,
		isGeneratingSecret,
		isRetrievingSecret,
		status,
		handleGenerateAndUploadSecret,
		handleRetrieveSecretFromWalrus,
	}
}
