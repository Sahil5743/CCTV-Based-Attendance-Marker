"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, Clock, CheckCircle } from "lucide-react"

export default function EmailPage() {
  const [emailSettings, setEmailSettings] = useState({
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: false,
    alertNotifications: true,
  })

  const emailHistory = [
    {
      id: 1,
      type: "Daily Report",
      recipients: 5,
      subject: "Daily Attendance Report - Dec 4, 2024",
      status: "Sent",
      timestamp: "06:00 AM",
      date: "Today",
    },
    {
      id: 2,
      type: "Alert",
      recipients: 2,
      subject: "Camera Offline Alert - Parking Lot",
      status: "Sent",
      timestamp: "02:30 PM",
      date: "Yesterday",
    },
    {
      id: 3,
      type: "Weekly Report",
      recipients: 8,
      subject: "Weekly Attendance Summary - Week 48",
      status: "Sent",
      timestamp: "08:00 AM",
      date: "Dec 2, 2024",
    },
    {
      id: 4,
      type: "Monthly Report",
      recipients: 12,
      subject: "Monthly Payroll Report - November 2024",
      status: "Failed",
      timestamp: "09:00 AM",
      date: "Dec 1, 2024",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-gray-600">Configure automated email reports and notifications</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Send Test Email
        </Button>
      </div>

      {/* Email Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent Today</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.5%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Recipients</CardTitle>
            <Mail className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">Subscribed users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Pending emails</p>
          </CardContent>
        </Card>
      </div>

      {/* Email Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
            <CardDescription>Configure SMTP settings and email preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-server">SMTP Server</Label>
              <Input id="smtp-server" placeholder="smtp.gmail.com" defaultValue="smtp.company.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtp-port">Port</Label>
                <Input id="smtp-port" placeholder="587" defaultValue="587" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="encryption">Encryption</Label>
                <Select defaultValue="tls">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender-email">Sender Email</Label>
              <Input id="sender-email" placeholder="noreply@company.com" defaultValue="attendance@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sender-name">Sender Name</Label>
              <Input id="sender-name" placeholder="Attendance System" defaultValue="AttendanceVision System" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automated Reports</CardTitle>
            <CardDescription>Configure automatic email report schedules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Reports</Label>
                <p className="text-sm text-muted-foreground">Send daily attendance summary at 6:00 AM</p>
              </div>
              <Switch
                checked={emailSettings.dailyReports}
                onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, dailyReports: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Send weekly summary every Monday at 8:00 AM</p>
              </div>
              <Switch
                checked={emailSettings.weeklyReports}
                onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, weeklyReports: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Monthly Reports</Label>
                <p className="text-sm text-muted-foreground">Send monthly payroll report on 1st of each month</p>
              </div>
              <Switch
                checked={emailSettings.monthlyReports}
                onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, monthlyReports: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alert Notifications</Label>
                <p className="text-sm text-muted-foreground">Send immediate alerts for system issues</p>
              </div>
              <Switch
                checked={emailSettings.alertNotifications}
                onCheckedChange={(checked) => setEmailSettings({ ...emailSettings, alertNotifications: checked })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email Recipients */}
      <Card>
        <CardHeader>
          <CardTitle>Email Recipients</CardTitle>
          <CardDescription>Manage who receives automated reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Input placeholder="Enter email address" className="flex-1" />
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Report Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="daily">Daily Only</SelectItem>
                  <SelectItem value="weekly">Weekly Only</SelectItem>
                  <SelectItem value="monthly">Monthly Only</SelectItem>
                  <SelectItem value="alerts">Alerts Only</SelectItem>
                </SelectContent>
              </Select>
              <Button>Add Recipient</Button>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Current Recipients</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">hr@company.com (All Reports)</Badge>
                <Badge variant="secondary">manager@company.com (Daily, Weekly)</Badge>
                <Badge variant="secondary">admin@company.com (Alerts)</Badge>
                <Badge variant="secondary">finance@company.com (Monthly)</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email History */}
      <Card>
        <CardHeader>
          <CardTitle>Email History</CardTitle>
          <CardDescription>Recent email activity and delivery status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailHistory.map((email) => (
              <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">{email.subject}</p>
                    <p className="text-sm text-gray-600">
                      {email.type} • {email.recipients} recipients
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={email.status === "Sent" ? "default" : "destructive"} className="text-xs">
                      {email.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {email.date} at {email.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
