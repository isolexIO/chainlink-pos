import { Card } from '@/components/ui/card';
import { LayoutGrid } from 'lucide-react';

const DepartmentGrid = ({ departments = [], onSelectDepartment }) => {
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
      {departments.map((dept) => (
        <Card
          key={dept.id}
          onClick={() => onSelectDepartment(dept.name)}
          className="aspect-square flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:shadow-lg hover:border-blue-500 transition-all group"
          style={{ backgroundColor: dept.color || '#FFFFFF' }}
        >
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
            {dept.name}
          </h3>
        </Card>
      ))}
    </div>
  );
};

export default DepartmentGrid;