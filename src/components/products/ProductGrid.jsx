import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Archive } from "lucide-react";

export default function ProductGrid({ products, onEdit, onToggleActive }) {
  if (products.length === 0) {
    return <div className="text-center py-12 text-gray-500">No products match your search.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 relative">
              <img
                src={product.image_url || `https://via.placeholder.com/400x300/F0F0F0/AAAAAA?text=${product.name}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="secondary" onClick={() => onEdit(product)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button size="icon" variant={product.is_active ? "destructive" : "default"} onClick={() => onToggleActive(product)}>
                  <Archive className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold line-clamp-2">{product.name}</h3>
                <Badge variant={product.is_active ? "default" : "destructive"}>
                  {product.is_active ? "Active" : "Archived"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 capitalize">{product.category}</p>
              <div className="flex justify-between items-end mt-2">
                <div className="text-lg font-bold">${product.price.toFixed(2)}</div>
                <div className="text-sm">
                  {product.stock_quantity} in stock
                  {product.stock_quantity <= product.low_stock_alert && (
                    <Badge variant="destructive" className="ml-2">Low</Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}