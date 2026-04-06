import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '../../../components/ui/dialog/Dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '../../../components/ui/select';
import { Plus, AlertCircle, ArrowRight, Upload, FileText, Image as ImageIcon, X, Calendar, Info, Settings, ShieldCheck, Tag, AlignLeft } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '../../../features/auth/AuthContext';

interface CreateEventModalProps {
    trigger?: React.ReactNode;
}

export function CreateEventModal({ trigger }: CreateEventModalProps) {
    const navigate = useNavigate();
    const { } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-primary hover:bg-primary/90 shadow-sm transition-all hover:scale-105 active:scale-95">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Event
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-primary/5 px-6 py-4 border-b border-primary/10">
                    <DialogTitle className="text-xl font-heading font-bold text-primary flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create New Event
                    </DialogTitle>
                    <DialogDescription className="text-primary/60 text-xs">
                        Fill out the details below to submit your event for approval.
                    </DialogDescription>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        navigate('/app/organizer/submissions');
                    }}
                    className="p-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Event Content */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                                <Info className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-semibold text-slate-700">Event Details</h3>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="title" className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                    <Tag className="w-3 h-3" /> Event Title
                                </Label>
                                <Input id="title" placeholder="e.g., Beach Cleanup Drive" className="h-9 focus-visible:ring-primary/20" />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                    <Settings className="w-3 h-3" /> Category
                                </Label>
                                <Select>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Select one" />
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

                            <div className="space-y-1.5">
                                <Label htmlFor="description" className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                    <AlignLeft className="w-3 h-3" /> Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="What is your event about?"
                                    className="min-h-[110px] resize-none text-sm"
                                />
                            </div>
                        </div>

                        {/* Right Column: Logistics & Verification */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                                <Calendar className="w-4 h-4 text-primary" />
                                <h3 className="text-sm font-semibold text-slate-700">Logistics & Verification</h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label htmlFor="date" className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        Date
                                    </Label>
                                    <Input id="date" type="date" className="h-9" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="location" className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                        Location
                                    </Label>
                                    <Input id="location" placeholder="Where will it happen?" className="h-9" />
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-1">
                                <Label className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                    <ShieldCheck className="w-3 h-3" /> Supporting Document
                                </Label>
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border border-dashed rounded-lg p-3 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 min-h-[80px] ${file ? 'border-primary/50 bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,image/*"
                                    />

                                    {file ? (
                                        <div className="flex items-center gap-2 w-full animate-in fade-in zoom-in duration-200 bg-white p-2 rounded border border-primary/10">
                                            <div className="p-1.5 bg-primary/10 rounded text-primary">
                                                {file.type.includes('image') ? (
                                                    <ImageIcon className="w-4 h-4" />
                                                ) : (
                                                    <FileText className="w-4 h-4" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-medium truncate">{file.name}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFile();
                                                }}
                                                className="p-1 hover:bg-red-50 hover:text-red-500 rounded transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="w-5 h-5 text-slate-400" />
                                            <div className="text-center">
                                                <p className="text-[10px] font-medium text-slate-600">Click to upload permit</p>
                                                <p className="text-[9px] text-slate-400">PDF or Image (Max 10MB)</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-6 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <p className="text-[10px] font-medium leading-none">
                                Admin review required before publishing
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="h-10 px-6 text-slate-500 hover:bg-slate-100">
                                    Cancel
                                </Button>
                            </DialogTrigger>
                            <Button type="submit" className="h-10 px-8 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                Submit Event <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
