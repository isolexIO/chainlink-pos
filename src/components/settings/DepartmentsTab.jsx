import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Layers, Plus, Edit2, Trash2, Package, AlertCircle, Save, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showBulkAssignDialog, setShowBulkAssignDialog] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newDepartmentDescription, setNewDepartmentDescription] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('DepartmentsTab: Loading data...');
      
      // Get current user - try pinLoggedInUser first
      const pinUserJSON = localStorage.getItem('pinLoggedInUser');
      let user = null;
      
      if (pinUserJSON) {
        try {
          user = JSON.parse(pinUserJSON);
          console.log('DepartmentsTab: Found pinLoggedInUser:', user.email, 'role:', user.role);
        } catch (e) {
          console.error('Error parsing pinLoggedInUser:', e);
        }
      }
      
      // Fallback to auth.me()
      if (!user) {
        try {
          user = await base44.auth.me();
          console.log('DepartmentsTab: Got user from auth.me():', user?.email);
        } catch (e) {
          console.error('Error getting authenticated user:', e);
          setError('Unable to authenticate. Please log in again.');
          setLoading(false);
          return;
        }
      }

      if (!user) {
        setError('No authenticated user found.');
        setLoading(false);
        return;
      }

      let merchantId = user?.merchant_id;
      console.log('DepartmentsTab: User merchant_id:', merchantId);

      // If no merchant_id on user, try to find it
      if (!merchantId && user?.email) {
        try {
          const merchants = await base44.entities.Merchant.filter({ 
            owner_email: user.email 
          });
          
          if (merchants && merchants.length > 0) {
            merchantId = merchants[0].id;
            user.merchant_id = merchantId;
            localStorage.setItem('pinLoggedInUser', JSON.stringify(user));
            console.log('DepartmentsTab: Found merchant_id:', merchantId);
          }
        } catch (e) {
          console.error('Error searching for merchant:', e);
        }
      }

      if (!merchantId) {
        setError('No merchant account found. Please complete onboarding.');
        setLoading(false);
        return;
      }

      setCurrentUser({ ...user, merchant_id: merchantId });

      // Load departments from Department entity
      console.log('DepartmentsTab: Loading departments for merchant:', merchantId);
      
      let deptList = [];
      try {
        // Load all departments and filter by merchant_id
        const allDepartments = await base44.entities.Department.list();
        console.log('DepartmentsTab: All departments in system:', allDepartments.length);
        
        // Filter by merchant_id
        deptList = allDepartments.filter(d => d.merchant_id === merchantId);
        console.log('DepartmentsTab: Filtered departments for merchant:', deptList.length, deptList);
      } catch (e) {
        console.error('DepartmentsTab: Error loading departments:', e);
        // Try filter as fallback
        try {
          deptList = await base44.entities.Department.filter({ 
            merchant_id: merchantId 
          });
          console.log('DepartmentsTab: Departments via filter:', deptList.length);
        } catch (filterError) {
          console.error('DepartmentsTab: Filter also failed:', filterError);
          deptList = [];
        }
      }
      
      // Load all products for this merchant
      console.log('DepartmentsTab: Loading products for merchant:', merchantId);
      
      let productList = [];
      try {
        const allProducts = await base44.entities.Product.list();
        console.log('DepartmentsTab: All products in system:', allProducts.length);
        
        // Filter by merchant_id
        productList = allProducts.filter(p => p.merchant_id === merchantId);
        console.log('DepartmentsTab: Filtered products for merchant:', productList.length);
      } catch (e) {
        console.error('DepartmentsTab: Error loading products:', e);
        productList = [];
      }
      
      setProducts(productList);

      // Count products per department
      const deptData = deptList.map(dept => ({
        ...dept,
        productCount: productList.filter(p => p.department === dept.name).length,
        products: productList.filter(p => p.department === dept.name)
      }));

      // Sort by display_order
      deptData.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));

      console.log('DepartmentsTab: Final departments with counts:', deptData);
      setDepartments(deptData);
      
    } catch (error) {
      console.error('DepartmentsTab: Error loading departments:', error);
      setError('Failed to load departments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartmentName.trim()) {
      alert('Please enter a department name');
      return;
    }

    if (departments.find(d => d.name.toLowerCase() === newDepartmentName.toLowerCase())) {
      alert('Department already exists');
      return;
    }

    try {
      await base44.entities.Department.create({
        merchant_id: currentUser.merchant_id,
        name: newDepartmentName.trim(),
        description: newDepartmentDescription.trim() || '',
        display_order: departments.length,
        is_active: true
      });

      setNewDepartmentName('');
      setNewDepartmentDescription('');
      setShowAddDialog(false);
      await loadData();
    } catch (error) {
      console.error('Error creating department:', error);
      alert('Failed to create department: ' + error.message);
    }
  };

  const handleStartEdit = (dept) => {
    setEditingDepartment(dept.id);
    setEditingName(dept.name);
    setEditingDescription(dept.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingName.trim()) {
      alert('Please enter a department name');
      return;
    }

    const existing = departments.find(d => 
      d.id !== editingDepartment && 
      d.name.toLowerCase() === editingName.toLowerCase()
    );

    if (existing) {
      alert('Department name already exists');
      return;
    }

    try {
      const dept = departments.find(d => d.id === editingDepartment);
      
      await base44.entities.Department.update(editingDepartment, {
        merchant_id: dept.merchant_id,
        name: editingName.trim(),
        description: editingDescription.trim() || '',
        display_order: dept.display_order,
        is_active: dept.is_active
      });

      // If department name changed, update all products using the old name
      if (dept.name !== editingName) {
        const productsToUpdate = products.filter(p => p.department === dept.name);
        
        for (const product of productsToUpdate) {
          await base44.entities.Product.update(product.id, {
            merchant_id: product.merchant_id,
            name: product.name,
            price: product.price,
            department: editingName.trim()
          });
        }
      }

      setEditingDepartment(null);
      setEditingName('');
      setEditingDescription('');
      await loadData();
    } catch (error) {
      console.error('Error updating department:', error);
      alert('Failed to update department: ' + error.message);
    }
  };

  const handleCancelEdit = () => {
    setEditingDepartment(null);
    setEditingName('');
    setEditingDescription('');
  };

  const handleDeleteDepartment = async (dept) => {
    if (dept.productCount > 0) {
      const confirmed = confirm(
        `This department has ${dept.productCount} product(s). ` +
        `Deleting it will remove the department assignment from these products. Continue?`
      );
      
      if (!confirmed) return;

      // Remove department from all products
      const productsToUpdate = products.filter(p => p.department === dept.name);
      
      for (const product of productsToUpdate) {
        await base44.entities.Product.update(product.id, {
          merchant_id: product.merchant_id,
          name: product.name,
          price: product.price,
          department: null
        });
      }
    }

    try {
      await base44.entities.Department.delete(dept.id);
      await loadData();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert('Failed to delete department: ' + error.message);
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedDepartment) {
      alert('Please select a department');
      return;
    }

    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    try {
      for (const productId of selectedProducts) {
        const product = products.find(p => p.id === productId);
        await base44.entities.Product.update(productId, {
          merchant_id: product.merchant_id,
          name: product.name,
          price: product.price,
          department: selectedDepartment
        });
      }

      setSelectedDepartment('');
      setSelectedProducts([]);
      setShowBulkAssignDialog(false);
      await loadData();
    } catch (error) {
      console.error('Error bulk assigning products:', error);
      alert('Failed to assign products: ' + error.message);
    }
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading departments...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="text-center mt-4">
            <Button onClick={loadData} variant="outline">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Department Management
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={() => setShowBulkAssignDialog(true)} variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Bulk Assign Products
              </Button>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg text-gray-600 mb-2">No departments yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Create departments to organize your products
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Department
                </Button>
              </div>
            ) : (
              departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {editingDepartment === dept.id ? (
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor="edit-name">Department Name</Label>
                        <Input
                          id="edit-name"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          placeholder="Department name"
                          className="max-w-md"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-description">Description (optional)</Label>
                        <Textarea
                          id="edit-description"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Department description"
                          className="max-w-md"
                          rows={2}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{dept.name}</h3>
                          <Badge variant="secondary">
                            {dept.productCount} {dept.productCount === 1 ? 'product' : 'products'}
                          </Badge>
                          {!dept.is_active && (
                            <Badge variant="destructive">Inactive</Badge>
                          )}
                        </div>
                        {dept.description && (
                          <p className="text-sm text-gray-500 mt-1">{dept.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartEdit(dept)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteDepartment(dept)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Department Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="new-dept-name">Department Name *</Label>
              <Input
                id="new-dept-name"
                value={newDepartmentName}
                onChange={(e) => setNewDepartmentName(e.target.value)}
                placeholder="e.g., Lunch, Dinner, Drinks"
              />
            </div>
            <div>
              <Label htmlFor="new-dept-description">Description (optional)</Label>
              <Textarea
                id="new-dept-description"
                value={newDepartmentDescription}
                onChange={(e) => setNewDepartmentDescription(e.target.value)}
                placeholder="Describe what products belong in this department"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddDepartment}>
              Create Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Assign Dialog */}
      <Dialog open={showBulkAssignDialog} onOpenChange={setShowBulkAssignDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bulk Assign Products to Department</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="select-dept">Select Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Select Products ({selectedProducts.length} selected)</Label>
              <div className="border rounded-lg p-4 mt-2 max-h-96 overflow-y-auto space-y-2">
                {!products || products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 mb-2">No products available</p>
                    <p className="text-sm text-gray-400">Create products first in the Products page</p>
                  </div>
                ) : (
                  products.map((product) => (
                    <div key={product.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded">
                      <Checkbox
                        id={`product-${product.id}`}
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProductSelection(product.id)}
                      />
                      <Label
                        htmlFor={`product-${product.id}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{product.name}</span>
                          <div className="flex items-center gap-2">
                            {product.department && (
                              <Badge variant="outline" className="text-xs">
                                {product.department}
                              </Badge>
                            )}
                            <span className="text-sm text-gray-500">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkAssign} disabled={!selectedDepartment || selectedProducts.length === 0}>
              Assign to Department
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}