import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save } from "lucide-react";

export default function InventoryManager({ products, onUpdateStock }) {
  const [stockLevels, setStockLevels] = useState({});

  const handleStockChange = (productId, newStock) => {
    setStockLevels(prev => ({ ...prev, [productId]: newStock }));
  };

  const handleSaveChanges = () => {
    onUpdateStock(stockLevels);
    setStockLevels({});
  };

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleSaveChanges} disabled={Object.keys(stockLevels).length === 0}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes ({Object.keys(stockLevels).length})
        </Button>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead className="text-right">Current Stock</TableHead>
              <TableHead className="w-48 text-right">New Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map(product => {
              const currentStock = product.stock_quantity;
              const isLowStock = currentStock <= product.low_stock_alert;

              return (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span>{currentStock}</span>
                      {isLowStock && <Badge variant="destructive">Low</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      className="w-24 ml-auto text-right"
                      placeholder={currentStock.toString()}
                      value={stockLevels[product.id] ?? ""}
                      onChange={(e) => handleStockChange(product.id, parseInt(e.target.value))}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}