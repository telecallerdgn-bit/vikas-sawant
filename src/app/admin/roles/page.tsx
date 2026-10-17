import UserTable from "@/components/UserTable";

export default function RolesPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Role Assignments</h1>
      <UserTable />
    </div>
  );
}