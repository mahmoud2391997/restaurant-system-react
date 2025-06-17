import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBranches,
  fetchBranchById,
  createBranch,
  updateBranch,
  selectBranches,
  selectBranch,
  selectLoading,
  selectError,
} from "../store/slices/branchSlice";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  CheckCircle,
  X,
  Plus,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { useForm, SubmitHandler } from "react-hook-form";
import type { Branch } from "@/types/entities";

const branchAnalytics = {
  "BRANCH-001": {
    dailyRevenue: 2850.75,
    monthlyRevenue: 85522.5,
    dailyOrders: 127,
    monthlyOrders: 3810,
    avgOrderValue: 22.45,
    customerSatisfaction: 4.6,
    employeeCount: 12,
    activeEmployees: 8,
    peakHours: "12:00-14:00, 19:00-21:00",
    topSellingItems: ["Margherita Pizza", "Caesar Salad", "Beef Burger"],
    revenueGrowth: 12.5,
    orderGrowth: 8.3,
    efficiency: 87,
    costs: {
      labor: 15420.3,
      inventory: 28650.75,
      utilities: 3240.5,
      rent: 8500.0,
      other: 2180.25,
    },
  },
  "BRANCH-002": {
    dailyRevenue: 1950.25,
    monthlyRevenue: 58507.5,
    dailyOrders: 89,
    monthlyOrders: 2670,
    avgOrderValue: 21.9,
    customerSatisfaction: 4.4,
    employeeCount: 8,
    activeEmployees: 6,
    peakHours: "11:30-13:30, 18:30-20:30",
    topSellingItems: ["Pasta Carbonara", "Margherita Pizza", "Caesar Salad"],
    revenueGrowth: 6.8,
    orderGrowth: 4.2,
    efficiency: 82,
    costs: {
      labor: 10280.2,
      inventory: 19540.3,
      utilities: 2180.75,
      rent: 6200.0,
      other: 1450.8,
    },
  },
};

type BranchFormValues = Omit<Branch, "id" | "createdAt" | "updatedAt">;

export default function BranchesPage() {
  const dispatch = useAppDispatch();
  const branches = useAppSelector(selectBranches);
  const currentBranch = useAppSelector(selectBranch);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BranchFormValues>();

  useEffect(() => {
    dispatch(fetchBranches());
  }, [dispatch]);

  useEffect(() => {
    if (branches.length > 0 && !selectedBranch) {
      setSelectedBranch(branches[0]);
    }
  }, [branches, selectedBranch]);

  useEffect(() => {
    if (selectedBranch) {
      dispatch(fetchBranchById(selectedBranch.id));
    }
  }, [selectedBranch, dispatch]);

  const getBranchAnalytics = (branchId: string) => {
    return branchAnalytics[branchId as keyof typeof branchAnalytics] || branchAnalytics["BRANCH-001"];
  };

  const openAddDialog = () => {
    reset({
      name: "",
      address: "",
      phone: "",
      email: "",
      openingTime: "09:00",
      closingTime: "21:00",
      timezone: "America/New_York",
      isActive: true,
      managerId: "",
    });
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (branch: Branch) => {
    setValue("name", branch.name);
    setValue("address", branch.address);
    setValue("phone", branch.phone);
    setValue("email", branch.email);
    setValue("openingTime", branch.openingTime);
    setValue("closingTime", branch.closingTime);
    setValue("timezone", branch.timezone);
    setValue("isActive", branch.isActive);
    setValue("managerId", branch.managerId || "");
    setIsEditDialogOpen(true);
  };

  const onSubmitAdd: SubmitHandler<BranchFormValues> = (data) => {
    dispatch(createBranch(data));
    setIsAddDialogOpen(false);
  };

  const onSubmitEdit: SubmitHandler<BranchFormValues> = (data) => {
    if (selectedBranch) {
      dispatch(updateBranch({ id: selectedBranch.id, data }));
      setIsEditDialogOpen(false);
    }
  };

  if (loading && !branches.length) {
    return <div>Loading branches...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const analytics = selectedBranch ? getBranchAnalytics(selectedBranch.id) : null;

  return (
    <div className="space-y-6 p-6">
      {/* Add Branch Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
            <DialogDescription>Fill out the form to add a new restaurant branch location.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitAdd)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Branch name is required" })}
                  placeholder="Main Branch"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  {...register("address", { required: "Address is required" })}
                  placeholder="123 Main Street"
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    {...register("phone", { required: "Phone number is required" })}
                    placeholder="+1-555-0001"
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                    placeholder="branch@restaurant.com"
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingTime">Opening Time</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    {...register("openingTime", { required: "Opening time is required" })}
                  />
                  {errors.openingTime && (
                    <p className="text-sm text-red-500">{errors.openingTime.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closingTime">Closing Time</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    {...register("closingTime", { required: "Closing time is required" })}
                  />
                  {errors.closingTime && (
                    <p className="text-sm text-red-500">{errors.closingTime.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input
                  id="timezone"
                  {...register("timezone", { required: "Timezone is required" })}
                  placeholder="America/New_York"
                />
                {errors.timezone && (
                  <p className="text-sm text-red-500">{errors.timezone.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="isActive" {...register("isActive")} defaultChecked />
                <Label htmlFor="isActive">Active Branch</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Branch Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>Update the details of this restaurant branch location.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitEdit)}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Branch Name</Label>
                <Input
                  id="edit-name"
                  {...register("name", { required: "Branch name is required" })}
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  {...register("address", { required: "Address is required" })}
                />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone</Label>
                  <Input
                    id="edit-phone"
                    {...register("phone", { required: "Phone number is required" })}
                  />
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    {...register("email", { required: "Email is required" })}
                  />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-openingTime">Opening Time</Label>
                  <Input
                    id="edit-openingTime"
                    type="time"
                    {...register("openingTime", { required: "Opening time is required" })}
                  />
                  {errors.openingTime && (
                    <p className="text-sm text-red-500">{errors.openingTime.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-closingTime">Closing Time</Label>
                  <Input
                    id="edit-closingTime"
                    type="time"
                    {...register("closingTime", { required: "Closing time is required" })}
                  />
                  {errors.closingTime && (
                    <p className="text-sm text-red-500">{errors.closingTime.message}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-timezone">Timezone</Label>
                <Input
                  id="edit-timezone"
                  {...register("timezone", { required: "Timezone is required" })}
                />
                {errors.timezone && (
                  <p className="text-sm text-red-500">{errors.timezone.message}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="edit-isActive" {...register("isActive")} />
                <Label htmlFor="edit-isActive">Active Branch</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                <Pencil className="mr-2 h-4 w-4" />
                Update Branch
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
          <p className="text-muted-foreground">
            Monitor and analyze performance across all restaurant locations
          </p>
        </div>
        <Button onClick={openAddDialog}>
          <Building2 className="mr-2 h-4 w-4" />
          Add New Branch
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{branches.length}</div>
            <p className="text-xs text-muted-foreground">
              {branches.filter((b) => b.isActive).length} active locations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$144,030</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+9.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,480</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+6.1%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.5</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Branch List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Branch Locations</CardTitle>
            <CardDescription>Select a branch to view detailed analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {branches.map((branch) => {
              const branchStats = getBranchAnalytics(branch.id);
              return (
                <div
                  key={branch.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedBranch?.id === branch.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedBranch(branch)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{branch.name}</h3>
                        <Badge variant={branch.isActive ? "default" : "secondary"}>
                          {branch.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-3 w-3" />
                        {branch.address}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="mr-1 h-3 w-3" />
                        {branch.openingTime} - {branch.closingTime}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBranch(branch);
                        openEditDialog(branch);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Daily Revenue</p>
                      <p className="font-semibold">${branchStats.dailyRevenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Orders Today</p>
                      <p className="font-semibold">{branchStats.dailyOrders}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Branch Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {selectedBranch && analytics && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        {selectedBranch.name} - Analytics Dashboard
                      </CardTitle>
                      <CardDescription>Comprehensive performance metrics and insights</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => openEditDialog(selectedBranch)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Branch
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="overview" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="financial">Financial</TabsTrigger>
                      <TabsTrigger value="operations">Operations</TabsTrigger>
                      <TabsTrigger value="staff">Staff</TabsTrigger>
                    </TabsList>
                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              ${analytics.monthlyRevenue.toLocaleString()}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              {analytics.revenueGrowth > 0 ? (
                                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                              )}
                              <span
                                className={
                                  analytics.revenueGrowth > 0 ? "text-green-600" : "text-red-600"
                                }
                              >
                                {analytics.revenueGrowth > 0 ? "+" : ""}
                                {analytics.revenueGrowth}%
                              </span>
                              <span className="ml-1">from last month</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Orders</CardTitle>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">
                              {analytics.monthlyOrders.toLocaleString()}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              {analytics.orderGrowth > 0 ? (
                                <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                              ) : (
                                <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                              )}
                              <span
                                className={
                                  analytics.orderGrowth > 0 ? "text-green-600" : "text-red-600"
                                }
                              >
                                {analytics.orderGrowth > 0 ? "+" : ""}
                                {analytics.orderGrowth}%
                              </span>
                              <span className="ml-1">from last month</span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                            <PieChart className="h-4 w-4 text-muted-foreground" />
                          </CardHeader>
                          <CardContent>
                            <div className="text-2xl font-bold">${analytics.avgOrderValue}</div>
                            <p className="text-xs text-muted-foreground">Per transaction</p>
                          </CardContent>
                        </Card>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Performance Metrics</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Customer Satisfaction</span>
                                <span>{analytics.customerSatisfaction}/5.0</span>
                              </div>
                              <Progress value={(analytics.customerSatisfaction / 5) * 100} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Operational Efficiency</span>
                                <span>{analytics.efficiency}%</span>
                              </div>
                              <Progress value={analytics.efficiency} />
                            </div>
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Staff Utilization</span>
                                <span>
                                  {Math.round(
                                    (analytics.activeEmployees / analytics.employeeCount) * 100
                                  )}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={(analytics.activeEmployees / analytics.employeeCount) * 100}
                              />
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Top Selling Items</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {analytics.topSellingItems.map((item, index) => (
                                <div key={item} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">{index + 1}</Badge>
                                    <span className="text-sm">{item}</span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {Math.floor(Math.random() * 50) + 20} orders
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    <TabsContent value="financial" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Revenue Breakdown</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span>Daily Revenue</span>
                              <span className="font-semibold">
                                ${analytics.dailyRevenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monthly Revenue</span>
                              <span className="font-semibold">
                                ${analytics.monthlyRevenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Average Order Value</span>
                              <span className="font-semibold">${analytics.avgOrderValue}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                              <span>Growth Rate</span>
                              <span
                                className={
                                  analytics.revenueGrowth > 0 ? "text-green-600" : "text-red-600"
                                }
                              >
                                {analytics.revenueGrowth > 0 ? "+" : ""}
                                {analytics.revenueGrowth}%
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Cost Analysis</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span>Labor Costs</span>
                              <span>${analytics.costs.labor.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Inventory</span>
                              <span>${analytics.costs.inventory.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Utilities</span>
                              <span>${analytics.costs.utilities.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rent</span>
                              <span>${analytics.costs.rent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Other</span>
                              <span>${analytics.costs.other.toLocaleString()}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                              <span>Total Costs</span>
                              <span>
                                $
                                {Object.values(analytics.costs)
                                  .reduce((a, b) => a + b, 0)
                                  .toLocaleString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    <TabsContent value="operations" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Operating Hours</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span>Opening Time</span>
                              <span>{selectedBranch.openingTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Closing Time</span>
                              <span>{selectedBranch.closingTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Peak Hours</span>
                              <span className="text-sm">{analytics.peakHours}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Status</span>
                              <Badge variant={selectedBranch.isActive ? "default" : "secondary"}>
                                {selectedBranch.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Contact Information</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedBranch.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedBranch.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{selectedBranch.address}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">
                                Opened:{" "}
                                {new Date(selectedBranch.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                    <TabsContent value="staff" className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">Staff Overview</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between">
                              <span>Total Employees</span>
                              <span className="font-semibold">{analytics.employeeCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Currently Active</span>
                              <span className="font-semibold text-green-600">
                                {analytics.activeEmployees}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Off Duty</span>
                              <span className="font-semibold text-orange-600">
                                {analytics.employeeCount - analytics.activeEmployees}
                              </span>
                            </div>
                            <Separator />
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Staff Utilization</span>
                                <span>
                                  {Math.round(
                                    (analytics.activeEmployees / analytics.employeeCount) * 100
                                  )}
                                  %
                                </span>
                              </div>
                              <Progress
                                value={
                                  (analytics.activeEmployees / analytics.employeeCount) * 100
                                }
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}