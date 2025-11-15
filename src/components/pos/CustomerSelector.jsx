
import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // Added DialogTrigger import
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { User, Plus, Star } from "lucide-react";

export default function CustomerSelector({ 
  customers, 
  selectedCustomer, 
  onSelectCustomer 
}) {
  const [open, setOpen] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleAddCustomer = async () => {
    try {
      const customer = await base44.entities.Customer.create(newCustomer);
      onSelectCustomer(customer);
      setNewCustomer({ name: "", email: "", phone: "" });
      setShowAddDialog(false);
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between min-w-[200px]"
          >
            {selectedCustomer ? (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{selectedCustomer?.name || 'Customer'}</span>
                <Badge variant="secondary" className="text-xs">
                  {selectedCustomer?.loyalty_points || 0} pts
                </Badge>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <User className="w-4 h-4" />
                <span>Select Customer</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Command>
            <CommandInput placeholder="Search customers..." />
            <CommandEmpty>No customers found.</CommandEmpty>
            <CommandGroup>
              <CommandList className="max-h-64 overflow-y-auto">
                <CommandItem
                  onSelect={() => {
                    onSelectCustomer(null);
                    setOpen(false);
                  }}
                  className="cursor-pointer"
                >
                  <User className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Walk-in Customer</span>
                </CommandItem>
                {customers && Array.isArray(customers) && customers.map((customer) => (
                  <CommandItem
                    key={customer?.id || Math.random()}
                    onSelect={() => {
                      onSelectCustomer(customer);
                      setOpen(false);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {(customer?.name || 'C').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{customer?.name || 'Customer'}</div>
                          {customer?.email && (
                            <div className="text-xs text-gray-500">{customer.email}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {customer?.loyalty_points || 0} pts
                        </Badge>
                        {(customer?.loyalty_points || 0) > 100 && (
                          <Star className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="w-4 h-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Customer
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name *</label>
              <Input
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                placeholder="Customer name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                value={newCustomer.email}
                onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                placeholder="customer@example.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                placeholder="(555) 123-4567"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddCustomer}
                disabled={!newCustomer.name.trim()}
                className="flex-1"
              >
                Add Customer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
