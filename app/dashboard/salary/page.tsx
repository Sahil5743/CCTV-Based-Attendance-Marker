"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Download, Calculator, TrendingUp, Users } from "lucide-react"

export default function SalaryPage() {
  const salaryData = [
    {
      id: 1,
      name: "John Smith",
      employeeId: "EMP001",
      baseSalary: 5000,
      workingDays: 22,
      presentDays: 20,
      overtimeHours: 8,
      overtimeRate: 25,
      deductions: 200,
      netSalary: 4950,
      status: "Processed",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      employeeId: "EMP002",
      baseSalary: 4500,
      workingDays: 22,
      presentDays: 22,
      overtimeHours: 12,
      overtimeRate: 22,
      deductions: 150,
      netSalary: 4614,
      status: "Processed",
    },
    {
      id: 3,
      name: "Mike Davis",
      employeeId: "EMP003",
      baseSalary: 5500,
      workingDays: 22,
      presentDays: 19,
      overtimeHours: 5,
      overtimeRate: 28,
      deductions: 300,
      netSalary: 5065,
      status: "Pending",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Salary Management</h1>
          <p className="text-gray-600">Automated salary calculation based on attendance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calculator className="h-4 w-4 mr-2" />
            Calculate All
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Payroll
          </Button>
        </div>
      </div>

      {/* Salary Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">198</div>
            <p className="text-xs text-muted-foreground">Employees paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overtime Pay</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$3,420</div>
            <p className="text-xs text-muted-foreground">Extra compensation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deductions</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,150</div>
            <p className="text-xs text-muted-foreground">Total deductions</p>
          </CardContent>
        </Card>
      </div>

      {/* Salary Calculation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Salary Calculation Settings</CardTitle>
          <CardDescription>Configure automatic salary calculation parameters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Working Days/Month</label>
              <Input type="number" defaultValue="22" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Standard Hours/Day</label>
              <Input type="number" defaultValue="8" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Overtime Multiplier</label>
              <Input type="number" step="0.1" defaultValue="1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Salary Details</CardTitle>
          <CardDescription>Detailed salary breakdown for each employee</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Present Days</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salaryData.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{record.name}</div>
                      <div className="text-sm text-gray-600">{record.employeeId}</div>
                    </div>
                  </TableCell>
                  <TableCell>${record.baseSalary}</TableCell>
                  <TableCell>
                    {record.presentDays}/{record.workingDays}
                  </TableCell>
                  <TableCell>
                    {record.overtimeHours}h × ${record.overtimeRate}
                  </TableCell>
                  <TableCell>${record.deductions}</TableCell>
                  <TableCell className="font-bold">${record.netSalary}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === "Processed" ? "default" : "secondary"}>{record.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View
                      </Button>
                      <Button size="sm">Process</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
