"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { mockCustomers } from "@/lib/mock-data";
import { Search, AlertTriangle } from "lucide-react";

interface CustomerTableProps {
  onSelectCustomer?: (customerId: string) => void;
  selectedCustomerId?: string | null;
}

export default function CustomerTable({ onSelectCustomer, selectedCustomerId }: CustomerTableProps) {
  const [search, setSearch] = useState("");

  const filtered = mockCustomers.filter((c) => {
    if (!search) return true;
    return (
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 max-w-sm">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="bg-transparent text-sm outline-none placeholder:text-muted-foreground w-full"
        />
      </div>

      <div className="rounded-lg border border-border/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="text-xs font-semibold">Name</TableHead>
              <TableHead className="text-xs font-semibold">Phone</TableHead>
              <TableHead className="text-xs font-semibold hidden md:table-cell">Email</TableHead>
              <TableHead className="text-xs font-semibold text-center">Bookings</TableHead>
              <TableHead className="text-xs font-semibold text-center">No-Shows</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((customer) => (
              <TableRow
                key={customer.id}
                className={`cursor-pointer transition-colors ${
                  selectedCustomerId === customer.id ? "bg-primary/5" : "hover:bg-muted/20"
                }`}
                onClick={() => onSelectCustomer?.(customer.id)}
              >
                <TableCell className="text-sm font-medium">
                  <div className="flex items-center gap-2">
                    {customer.name}
                    {customer.noShowCount >= 2 && (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground font-mono text-xs">
                  +{customer.phone}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                  {customer.email ?? "—"}
                </TableCell>
                <TableCell className="text-sm text-center">{customer.totalBookings}</TableCell>
                <TableCell className="text-sm text-center">
                  {customer.noShowCount > 0 ? (
                    <span className="text-red-600 font-medium">{customer.noShowCount}</span>
                  ) : (
                    <span className="text-muted-foreground">0</span>
                  )}
                </TableCell>
                <TableCell>
                  {customer.isBlacklisted ? (
                    <Badge variant="outline" className="text-[11px] bg-red-100 text-red-700 border-red-200">
                      Blacklisted
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[11px] bg-emerald-100 text-emerald-700 border-emerald-200">
                      Active
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
