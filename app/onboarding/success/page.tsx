import Link from "next/link";

export default function OnboardingSuccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-lg mx-auto px-4 text-center space-y-6">
        <div className="text-6xl">&#10003;</div>
        <h1 className="text-3xl font-bold text-gray-900">Salon Created!</h1>
        <p className="text-gray-600">
          Your salon has been set up successfully. Next steps:
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6 text-left space-y-4">
          <h3 className="font-semibold text-gray-800">
            Configure WhatsApp Webhook
          </h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li>
              Go to your Meta Business dashboard &rarr; WhatsApp &rarr;
              Configuration
            </li>
            <li>
              Set the <strong>Callback URL</strong> to your Convex HTTP endpoint
              (shown in your Convex dashboard under &quot;HTTP Actions&quot;)
            </li>
            <li>
              Set the <strong>Verify Token</strong> to the value in your{" "}
              <code className="bg-gray-100 px-1 rounded">.env.local</code> file
            </li>
            <li>
              Subscribe to the <strong>messages</strong> webhook field
            </li>
          </ol>
        </div>

        <Link
          href="/"
          className="inline-block text-green-600 hover:text-green-700 font-medium"
        >
          &larr; Back to home
        </Link>
      </div>
    </div>
  );
}
