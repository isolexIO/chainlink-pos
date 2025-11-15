import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

const ROLES = [
  { value: "cashier", label: "Cashier", description: "Process orders and payments" },
  { value: "manager", label: "Manager", description: "Full operational access" },
  { value: "kitchen", label: "Kitchen Staff", description: "View and manage kitchen orders" },
  { value: "delivery", label: "Delivery Driver", description: "Manage deliveries" },
  { value: "viewer", label: "Viewer", description: "Read-only access to reports" },
  { value: "merchant_admin", label: "Admin", description: "Full system access" }
];

const PERMISSION_GROUPS = {
  operations: {
    label: "Operations",
    permissions: [
      { id: "process_orders", label: "Process Orders", description: "Create and manage orders" },
      { id: "process_refunds", label: "Process Refunds", description: "Issue refunds to customers" },
      { id: "manage_customers", label: "Manage Customers", description: "Add and edit customer information" }
    ]
  },
  inventory: {
    label: "Inventory & Products",
    permissions: [
      { id: "manage_inventory", label: "Manage Inventory", description: "Stock management and reordering" }
    ]
  },
  reporting: {
    label: "Analytics & Reporting",
    permissions: [
      { id: "view_reports", label: "View Reports", description: "Access sales and analytics reports" }
    ]
  },
  administration: {
    label: "Administration",
    permissions: [
      { id: "manage_users", label: "Manage Users", description: "Add, edit, and remove users" },
      { id: "admin_settings", label: "Admin Settings", description: "Configure system settings" },
      { id: "configure_devices", label: "Configure Devices", description: "Manage hardware and terminals" },
      { id: "configure_payments", label: "Configure Payments", description: "Set up payment gateways" },
      { id: "manage_subscriptions", label: "Manage Subscriptions", description: "Handle billing and plans" }
    ]
  },
  integrations: {
    label: "Integrations",
    permissions: [
      { id: "access_marketplace", label: "Access Marketplace", description: "View and manage integrations" }
    ]
  },
  support: {
    label: "Support",
    permissions: [
      { id: "submit_tickets", label: "Submit Tickets", description: "Create support tickets" },
      { id: "view_all_tickets", label: "View All Tickets", description: "View all support tickets" }
    ]
  }
};

const ROLE_DEFAULT_PERMISSIONS = {
  cashier: ["process_orders", "submit_tickets"],
  manager: ["process_orders", "manage_inventory", "view_reports", "manage_customers", "process_refunds", "submit_tickets"],
  kitchen: ["process_orders", "submit_tickets"],
  delivery: ["process_orders", "submit_tickets"],
  viewer: ["view_reports", "submit_tickets"],
  merchant_admin: [
    "process_orders", "manage_inventory", "view_reports", "manage_customers",
    "process_refunds", "admin_settings", "manage_users", "access_marketplace",
    "configure_devices", "configure_payments", "manage_subscriptions",
    "submit_tickets", "view_all_tickets"
  ]
};

export default function UserForm({ user, onSave, onCancel }) {
  const [formData, setFormData] = useState(
    user || {
      full_name: "",
      email: "",
      pin: "",
      role: "cashier",
      permissions: ["process_orders", "submit_tickets"],
      hourly_rate: 0,
      is_active: true,
    }
  );

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleRoleChange = (newRole) => {
    // Auto-assign permissions based on role
    const defaultPermissions = ROLE_DEFAULT_PERMISSIONS[newRole] || [];
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      permissions: defaultPermissions
    }));
  };

  const handlePermissionToggle = (permission) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.pin) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.pin.length !== 4) {
      alert("PIN must be exactly 4 digits");
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="full_name">Full Name *</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleChange("full_name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="pin">PIN (4 digits) *</Label>
            <Input
              id="pin"
              type="text"
              maxLength="4"
              value={formData.pin}
              onChange={(e) => handleChange("pin", e.target.value.replace(/\D/g, ''))}
              placeholder="1234"
              required
            />
            <p className="text-xs text-gray-500 mt-1">User will use this PIN to clock in</p>
          </div>

          <div>
            <Label htmlFor="hourly_rate">Hourly Rate (optional)</Label>
            <Input
              id="hourly_rate"
              type="number"
              step="0.01"
              value={formData.hourly_rate}
              onChange={(e) => handleChange("hourly_rate", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role & Permissions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={handleRoleChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div>
                      <div className="font-medium">{role.label}</div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              Default permissions will be applied based on role
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <h4 className="font-medium">Custom Permissions</h4>
            </div>
            
            {Object.entries(PERMISSION_GROUPS).map(([groupKey, group]) => (
              <div key={groupKey} className="mb-6">
                <h5 className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {group.label}
                </h5>
                <div className="space-y-2">
                  {group.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <Checkbox
                        id={permission.id}
                        checked={formData.permissions.includes(permission.id)}
                        onCheckedChange={() => handlePermissionToggle(permission.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={permission.id}
                          className="font-medium cursor-pointer"
                        >
                          {permission.label}
                        </Label>
                        <p className="text-xs text-gray-500">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange("is_active", checked)}
            />
            <Label htmlFor="is_active" className="font-medium">
              Account Active
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {user ? "Update User" : "Create User"}
        </Button>
      </div>
    </form>
  );
}