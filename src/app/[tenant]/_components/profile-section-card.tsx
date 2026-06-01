"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ProfileSectionCardProps {
  title: string;
  description: string;
  onEditClick?: () => void;
  readOnlyMode?: boolean;
  children: React.ReactNode;
}

export function ProfileSectionCard({
  title,
  description,
  onEditClick,
  readOnlyMode = false,
  children,
}: ProfileSectionCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        {!readOnlyMode && onEditClick && (
          <Button variant="outline" size="sm" onClick={onEditClick}>
            <Pencil className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </div>
      {children}
    </Card>
  );
}
