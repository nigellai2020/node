var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
define("hello", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.hello = void 0;
    function hello() {
        return 'hello';
    }
    exports.hello = hello;
});
define("model/demo.pdm", ["require", "exports", "@ijstech/pdm"], function (require, exports, PDM) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Context = exports.Product = exports.ProductLine = exports.Payment = exports.Order = exports.OrderDetails = exports.Office = exports.Employee = exports.Customer = void 0;
    PDM = __importStar(PDM);
    class Customer extends PDM.TRecord {
    }
    __decorate([
        PDM.KeyField()
    ], Customer.prototype, "guid", void 0);
    __decorate([
        PDM.RefTo('employee', 'salesRepEmployeeGuid')
    ], Customer.prototype, "salesRep", void 0);
    __decorate([
        PDM.IntegerField()
    ], Customer.prototype, "customerNumber", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "customerName", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "contactLastName", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "contactFirstName", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "phone", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "addressLine1", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "addressLine2", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "city", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "state", void 0);
    __decorate([
        PDM.StringField({ size: 15 })
    ], Customer.prototype, "postalCode", void 0);
    __decorate([
        PDM.StringField()
    ], Customer.prototype, "country", void 0);
    __decorate([
        PDM.DecimalField({ size: 10, decimals: 2 })
    ], Customer.prototype, "creditLimit", void 0);
    exports.Customer = Customer;
    ;
    class Employee extends PDM.TRecord {
    }
    __decorate([
        PDM.KeyField()
    ], Employee.prototype, "guid", void 0);
    __decorate([
        PDM.IntegerField()
    ], Employee.prototype, "employeeNumber", void 0);
    __decorate([
        PDM.RefTo('office', 'officeGuid')
    ], Employee.prototype, "office", void 0);
    __decorate([
        PDM.RefTo('employee', 'reportsToGuid')
    ], Employee.prototype, "reportTo", void 0);
    __decorate([
        PDM.StringField()
    ], Employee.prototype, "lastName", void 0);
    __decorate([
        PDM.StringField()
    ], Employee.prototype, "firstName", void 0);
    __decorate([
        PDM.StringField()
    ], Employee.prototype, "extension", void 0);
    __decorate([
        PDM.StringField()
    ], Employee.prototype, "email", void 0);
    __decorate([
        PDM.StringField()
    ], Employee.prototype, "jobTitle", void 0);
    exports.Employee = Employee;
    ;
    class Office extends PDM.TRecord {
    }
    __decorate([
        PDM.KeyField()
    ], Office.prototype, "guid", void 0);
    __decorate([
        PDM.StringField({ size: 10 })
    ], Office.prototype, "officeCode", void 0);
    __decorate([
        PDM.StringField()
    ], Office.prototype, "city", void 0);
    __decorate([
        PDM.StringField()
    ], Office.prototype, "phone", void 0);
    __decorate([
        PDM.StringField()
    ], Office.prototype, "addressLine1", void 0);
    __decorate([
        PDM.StringField()
    ], Office.prototype, "addressLine2", void 0);
    __decorate([
        PDM.StringField()
    ], Office.prototype, "state", void 0);
    __decorate([
        PDM.StringField()
    ], Office.prototype, "country", void 0);
    __decorate([
        PDM.StringField({ size: 15 })
    ], Office.prototype, "postalCode", void 0);
    __decorate([
        PDM.StringField({ size: 10 })
    ], Office.prototype, "territory", void 0);
    exports.Office = Office;
    class OrderDetails extends PDM.TRecord {
    }
    __decorate([
        PDM.KeyField()
    ], OrderDetails.prototype, "guid", void 0);
    __decorate([
        PDM.RefTo('order', 'orderGuid')
    ], OrderDetails.prototype, "order", void 0);
    __decorate([
        PDM.RefTo('product', 'productGuid')
    ], OrderDetails.prototype, "product", void 0);
    __decorate([
        PDM.IntegerField()
    ], OrderDetails.prototype, "quantityOrdered", void 0);
    __decorate([
        PDM.DecimalField()
    ], OrderDetails.prototype, "priceEach", void 0);
    __decorate([
        PDM.IntegerField({ size: 6 })
    ], OrderDetails.prototype, "orderLineNumber", void 0);
    exports.OrderDetails = OrderDetails;
    class Order extends PDM.TRecord {
    }
    __decorate([
        PDM.KeyField()
    ], Order.prototype, "guid", void 0);
    __decorate([
        PDM.OneToMany(OrderDetails, 'order', 'orderDetails', 'orderGuid')
    ], Order.prototype, "orderDetails", void 0);
    __decorate([
        PDM.IntegerField()
    ], Order.prototype, "orderNumber", void 0);
    __decorate([
        PDM.RefTo('customer', 'customerGuid')
    ], Order.prototype, "customer", void 0);
    __decorate([
        PDM.DateField()
    ], Order.prototype, "orderDate", void 0);
    __decorate([
        PDM.DateField()
    ], Order.prototype, "requiredDate", void 0);
    __decorate([
        PDM.DateField()
    ], Order.prototype, "shippedDate", void 0);
    __decorate([
        PDM.StringField({ size: 15 })
    ], Order.prototype, "status", void 0);
    __decorate([
        PDM.StringField({ dataType: 'mediumText' })
    ], Order.prototype, "comments", void 0);
    exports.Order = Order;
    class Payment extends PDM.TRecord {
    }
    __decorate([
        PDM.KeyField()
    ], Payment.prototype, "guid", void 0);
    __decorate([
        PDM.RefTo('customer', 'customerGuid')
    ], Payment.prototype, "customer", void 0);
    __decorate([
        PDM.StringField()
    ], Payment.prototype, "checkNumber", void 0);
    __decorate([
        PDM.DateField()
    ], Payment.prototype, "paymentDate", void 0);
    __decorate([
        PDM.DecimalField()
    ], Payment.prototype, "amount", void 0);
    exports.Payment = Payment;
    class ProductLine extends PDM.TRecord {
    }
    __decorate([
        PDM.KeyField()
    ], ProductLine.prototype, "guid", void 0);
    __decorate([
        PDM.StringField()
    ], ProductLine.prototype, "productLine", void 0);
    __decorate([
        PDM.StringField({ size: 4000 })
    ], ProductLine.prototype, "textDescription", void 0);
    __decorate([
        PDM.StringField({ dataType: 'text' })
    ], ProductLine.prototype, "htmlDescription", void 0);
    __decorate([
        PDM.BlobField()
    ], ProductLine.prototype, "image", void 0);
    exports.ProductLine = ProductLine;
    ;
    class Product extends PDM.TRecord {
    }
    __decorate([
        PDM.KeyField()
    ], Product.prototype, "guid", void 0);
    __decorate([
        PDM.RefTo('productLine', 'productLineGuid')
    ], Product.prototype, "productLine", void 0);
    __decorate([
        PDM.StringField({ size: 15 })
    ], Product.prototype, "productCode", void 0);
    __decorate([
        PDM.StringField({ size: 70 })
    ], Product.prototype, "productName", void 0);
    __decorate([
        PDM.StringField({ size: 10 })
    ], Product.prototype, "productScale", void 0);
    __decorate([
        PDM.StringField()
    ], Product.prototype, "productVendor", void 0);
    __decorate([
        PDM.StringField()
    ], Product.prototype, "productDescription", void 0);
    __decorate([
        PDM.IntegerField()
    ], Product.prototype, "quantityInStock", void 0);
    __decorate([
        PDM.DecimalField()
    ], Product.prototype, "buyPrice", void 0);
    __decorate([
        PDM.DecimalField()
    ], Product.prototype, "MSRP", void 0);
    exports.Product = Product;
    ;
    class Context extends PDM.TContext {
    }
    __decorate([
        PDM.RecordSet('customers', Customer)
    ], Context.prototype, "customer", void 0);
    __decorate([
        PDM.RecordSet('employees', Employee)
    ], Context.prototype, "employee", void 0);
    __decorate([
        PDM.RecordSet('offices', Office)
    ], Context.prototype, "office", void 0);
    __decorate([
        PDM.RecordSet('orders', Order)
    ], Context.prototype, "order", void 0);
    __decorate([
        PDM.RecordSet('payments', Payment)
    ], Context.prototype, "payment", void 0);
    __decorate([
        PDM.RecordSet('productLines', ProductLine)
    ], Context.prototype, "productLine", void 0);
    __decorate([
        PDM.RecordSet('products', Product)
    ], Context.prototype, "product", void 0);
    exports.Context = Context;
    ;
    exports.default = Context;
});
define("index", ["require", "exports", "hello", "model/demo.pdm"], function (require, exports, Hello, demo_pdm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Demo = void 0;
    Hello = __importStar(Hello);
    class Demo {
        hello() {
            return Hello.hello();
        }
        async employee(employeeNumber) {
            let context = new demo_pdm_1.Context();
            context.employee.query.where('employeeNumber', '=', employeeNumber);
            let records = await context.employee.fetch();
            let emp = records[0];
            return records[0];
        }
    }
    exports.Demo = Demo;
    exports.default = Demo;
});