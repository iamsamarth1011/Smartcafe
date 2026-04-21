import { Utensils } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-cream text-gray-900">
      <main className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center">
        <div className="mb-6 rounded-full bg-brand/20 p-4 text-brand">
          <Utensils className="h-8 w-8" />
        </div>
        <p className="text-sm uppercase tracking-[0.2em] text-brand">
          Smartcafe
        </p>
        <h1 className="mt-3 text-4xl font-semibold sm:text-5xl">
          Order seamlessly from your table.
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-700">
          Scan a QR code, browse the menu, and place orders instantly. Built for
          modern restaurants and delightful dining experiences.
        </p>
      </main>
    </div>
  );
};

export default Home;
