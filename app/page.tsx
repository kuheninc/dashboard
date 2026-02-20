import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-900">
          WhatsApp AI Chatbot
        </h1>
        <p className="text-lg text-gray-600">
          Salon operations assistant powered by AI
        </p>
        <Link
          href="/onboarding"
          className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-green-700 transition-colors"
        >
          Set Up Your Salon
        </Link>
      </div>
    </div>
  );
}
