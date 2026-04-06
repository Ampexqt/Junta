import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription } from
'../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
'../../components/ui/select';
import { AlertCircle, ArrowRight } from 'lucide-react';
export function CreateEventPage() {
  const navigate = useNavigate();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/app/organizer/submissions');
  };
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      className="space-y-6 max-w-2xl">
      
      <div>
        <h1 className="font-heading font-semibold text-2xl text-foreground">
          Create New Event
        </h1>
        <p className="text-muted-foreground mt-1">
          Submit your event for admin approval.
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm border">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="e.g., Beach Cleanup Drive" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your event, its goals, and what participants should expect..."
                rows={4} />
              
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cleanup">Cleanup</SelectItem>
                    <SelectItem value="planting">Planting</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Event location" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max">Max Participants</Label>
                <Input id="max" type="number" placeholder="100" />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 h-11">
              
              Submit for Approval <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800">
            Approval Required
          </p>
          <p className="text-xs text-amber-700 mt-0.5">
            Your event will be reviewed by an admin before being published and
            visible to participants.
          </p>
        </div>
      </div>
    </motion.div>);

}
