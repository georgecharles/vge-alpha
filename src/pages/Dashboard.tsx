import { PropertyImporter } from '../components/PropertyImporter';

export default function Dashboard() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <PropertyImporter />
      </div>

      {/* Rest of your dashboard content */}
    </div>
  );
} 