import { FC, useState, useEffect } from "react"

interface SecretManagementProps {
	currentAccountAddress: string | undefined
	onStatusChange?: (status: string) => void
	commitment: string
	generatedSecret: string
	isGeneratingSecret: boolean
	isRetrievingSecret: boolean
	status: string
	handleGenerateAndUploadSecret: () => Promise<void>
	handleRetrieveSecretFromWalrus: (secretInput: string) => Promise<void>
}

export const SecretManagement: FC<SecretManagementProps> = ({
	onStatusChange,
	commitment,
	generatedSecret,
	isGeneratingSecret,
	isRetrievingSecret,
	status,
	handleGenerateAndUploadSecret,
	handleRetrieveSecretFromWalrus,
}) => {

	const [secretInput, setSecretInput] = useState<string>("")

	// Notify parent of status changes
	useEffect(() => {
		if (onStatusChange && status) {
			onStatusChange(status)
		}
	}, [onStatusChange, status])

	const handleLoadSecret = () => {
		handleRetrieveSecretFromWalrus(secretInput)
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
			<h3 className="text-xl font-semibold mb-4">My Secret (One-Time Setup)</h3>
			<p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
				Generate your secret once and use it for all lottery picks. This allows
				anonymous prize claiming with ZK proofs.
			</p>
			<div className="flex flex-col gap-4">
				{/* Generate Secret Button */}
				<div>
					<button
						onClick={handleGenerateAndUploadSecret}
						disabled={isGeneratingSecret}
						className="w-full px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
					>
						{isGeneratingSecret
							? "Generating..."
							: commitment
							? "✓ Secret Active - Click to Regenerate"
							: "Generate Secret"}
					</button>
				</div>

				{/* Load Secret Section */}
				<div className="border-t dark:border-gray-700 pt-4">
					<h4 className="font-semibold mb-2">Or Load Existing Secret</h4>
					<p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
						If you have your secret from before, enter it here (format: secret,nullifier)
					</p>
					<div className="flex gap-2">
						<input
							type="text"
							value={secretInput}
							onChange={(e) => setSecretInput(e.target.value)}
							placeholder="secret,nullifier"
							className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
						/>
						<button
							onClick={handleLoadSecret}
							disabled={isRetrievingSecret || !secretInput.trim()}
							className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
						>
							{isRetrievingSecret ? "Loading..." : "Load Secret"}
						</button>
					</div>
				</div>

				{/* Display Current Secret */}
				{generatedSecret && commitment && (
					<div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded">
						<p className="text-xs font-semibold text-green-800 dark:text-green-200 mb-2">
							✓ Secret Active - Use this for all lottery picks!
						</p>
						<div className="space-y-2">
							<div>
								<p className="text-xs font-medium mb-1">Your Secret Data:</p>
								<code className="block text-xs bg-white dark:bg-gray-800 p-2 rounded break-all font-mono">
									{generatedSecret}
								</code>
							</div>
							<div>
								<p className="text-xs font-medium mb-1">
									Base Commitment (for reference):
								</p>
								<code className="block text-xs bg-white dark:bg-gray-800 p-2 rounded break-all font-mono">
									{commitment}
								</code>
							</div>
							<p className="text-xs text-yellow-800 dark:text-yellow-200 mt-2 font-medium">
								⚠️ Save your secret data somewhere safe! You'll need it to claim prizes.
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
