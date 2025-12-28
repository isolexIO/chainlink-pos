import { Card } from '@/components/ui/card';
import { 
  LayoutGrid, 
  Utensils, Coffee, Pizza, Beer, Cake, Sandwich, IceCream, Wine,
  Salad, Fish, Drumstick, Soup, Cookie, Apple, Grape, Cherry
} from 'lucide-react';

const DepartmentGrid = ({ departments = [], onSelectDepartment }) => {
  const ICON_MAP = {
    'Utensils': Utensils,
    'Coffee': Coffee,
    'Pizza': Pizza,
    'Beer': Beer,
    'Cake': Cake,
    'Sandwich': Sandwich,
    'IceCream': IceCream,
    'Wine': Wine,
    'Salad': Salad,
    'Fish': Fish,
    'Drumstick': Drumstick,
    'Soup': Soup,
    'Cookie': Cookie,
    'Apple': Apple,
    'Grape': Grape,
    'Cherry': Cherry,
  };

  const getIconComponent = (iconName) => {
    return ICON_MAP[iconName] || Utensils;
  };

  if (!departments || departments.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <LayoutGrid className="w-12 h-12 mx-auto mb-4" />
        No departments found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {departments.map((dept) => {
        const IconComp = getIconComponent(dept.icon);
        return (
          <Card
            key={dept.id}
            onClick={() => onSelectDepartment(dept.name)}
            className="aspect-square flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all group"
            style={{ backgroundColor: dept.color || '#6366f1' }}
          >
            <IconComp className="w-10 h-10 text-white mb-2" />
            <h3 className="text-lg font-bold text-white">
              {dept.name}
            </h3>
          </Card>
        );
      })}
    </div>
  );
};

export default DepartmentGrid;