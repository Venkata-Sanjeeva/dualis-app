
import AddEmployeeForm from './AddEmployeeFrom';

const EmployeesPage = () => {

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
            {/* The Form - Now used as a page component */}
            <div className="">
                <AddEmployeeForm />
            </div>
        </div>
    );
};

export default EmployeesPage;