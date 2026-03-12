import { HRLayout } from "@/components/HRLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { User, Mail, Phone, Building2, MapPin, Shield, Edit2, Check, X, Loader2, Landmark, CreditCard, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { useProfileDetail, useUpdateProfile } from "@/hooks/api/useProfile";
import { useMyBankTax, useUpdateMyBankTax } from "@/hooks/api/useBankTax";
import { useToast } from "@/hooks/use-toast";

export default function MyProfile() {
  const { currentUser } = useAuth();
  const { data: profile, isLoading } = useProfileDetail(currentUser?.id);
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Bank & Tax
  const { data: bankTax, isLoading: bankTaxLoading } = useMyBankTax();
  const updateMyBankTax = useUpdateMyBankTax();
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    account_name: "",
    account_type: "",
    account_number: "",
  });

  const openBankEdit = () => {
    setBankForm({
      bank_name: bankTax?.bank_name || "",
      account_name: bankTax?.account_name || "",
      account_type: bankTax?.account_type || "",
      account_number: bankTax?.account_number || "",
    });
    setShowAccount(false);
    setBankDialogOpen(true);
  };

  const handleBankSave = async () => {
    const payload: Record<string, string> = {
      bank_name: bankForm.bank_name,
      account_name: bankForm.account_name,
      account_type: bankForm.account_type,
    };
    if (bankForm.account_number) payload.account_number = bankForm.account_number;

    try {
      await updateMyBankTax.mutateAsync(payload);
      toast({ title: "Bank & tax details updated" });
      setBankDialogOpen(false);
    } catch {
      toast({ title: "Failed to update bank & tax details", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (profile) {
      setPhone(profile.phone);
      setLocation(profile.location);
    }
  }, [profile]);

  const handleSave = () => {
    if (!currentUser) return;
    updateProfile.mutate({ id: currentUser.id, phone, location }, {
      onSuccess: () => {
        toast({ title: "Profile updated" });
        setEditing(false);
      },
      onError: () => toast({ title: "Failed to update profile", variant: "destructive" }),
    });
  };

  if (!currentUser) return null;

  const infoRows = [
    { icon: Mail, label: "Email", value: currentUser.email },
    { icon: Phone, label: "Phone", value: phone, editable: true },
    { icon: Building2, label: "Department", value: currentUser.department },
    { icon: MapPin, label: "Location", value: location, editable: true },
    { icon: Shield, label: "Role", value: currentUser.title },
    { icon: User, label: "Employee ID", value: profile?.employeeId ?? "" },
    { icon: User, label: "Start Date", value: profile?.startDate ?? "" },
    { icon: User, label: "Manager", value: profile?.manager ?? "" },
  ];

  return (
    <HRLayout
      title="My Profile"
      subtitle="Your personal information and account settings"
      actions={
        editing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditing(false)}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Save
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
            <Edit2 className="h-4 w-4 mr-1" /> Edit Profile
          </Button>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity card */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center gap-3">
          <div className="h-20 w-20 rounded-full bg-blue-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-blue-700 dark:text-blue-300">
            {currentUser.avatar}
          </div>
          <div>
            <h2 className="font-semibold text-lg text-foreground">{currentUser.name}</h2>
            <p className="text-sm text-muted-foreground">{currentUser.title}</p>
          </div>
          <StatusBadge
            label={currentUser.role === "hr_admin" ? "HR Admin" : "Employee"}
            variant={currentUser.role === "hr_admin" ? "info" : "success"}
          />
          <p className="text-xs text-muted-foreground">{currentUser.department}</p>
        </div>

        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4">Personal Information</h3>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {infoRows.map(({ icon: Icon, label, value, editable }) => (
                  <div key={label}>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </Label>
                    {editing && editable ? (
                      <Input
                        value={label === "Phone" ? phone : location}
                        onChange={(e) => label === "Phone" ? setPhone(e.target.value) : setLocation(e.target.value)}
                        className="h-8 text-sm"
                      />
                    ) : (
                      <p className="text-sm font-medium text-foreground">{value}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          {profile?.emergencyContact && (
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="font-semibold text-foreground mb-4">Emergency Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1">Name</Label>
                  <p className="text-sm font-medium text-foreground">{profile.emergencyContact.name}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1">Relation</Label>
                  <p className="text-sm font-medium text-foreground">{profile.emergencyContact.relation}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1">Phone</Label>
                  <p className="text-sm font-medium text-foreground">{profile.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          )}

          {/* Bank & Tax Details */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Landmark className="h-4 w-4 text-muted-foreground" /> Bank & Tax Details
              </h3>
              <Button size="sm" variant="outline" onClick={openBankEdit}>
                <Edit2 className="h-3.5 w-3.5 mr-1" /> {bankTax ? "Edit" : "Add"}
              </Button>
            </div>
            {bankTaxLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : !bankTax ? (
              <p className="text-sm text-muted-foreground">No bank or tax details on file. Click <strong>Add</strong> to set them up.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: Landmark, label: "Bank Name", value: bankTax.bank_name },
                  { icon: User, label: "Account Name", value: bankTax.account_name },
                  { icon: CreditCard, label: "Account Type", value: bankTax.account_type },
                  { icon: CreditCard, label: "Account Number", value: bankTax.masked_account },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                      <Icon className="h-3.5 w-3.5" /> {label}
                    </Label>
                    <p className="text-sm font-medium text-foreground font-mono">{value || "—"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bank & Tax Edit Dialog */}
      <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bank & Tax Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bank Name</Label>
                <Input value={bankForm.bank_name} onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })} placeholder="e.g. Barclays" />
              </div>
              <div className="space-y-2">
                <Label>Account Name</Label>
                <Input value={bankForm.account_name} onChange={(e) => setBankForm({ ...bankForm, account_name: e.target.value })} placeholder="e.g. John Smith" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <Select value={bankForm.account_type} onValueChange={(v) => setBankForm({ ...bankForm, account_type: v })}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Current">Current</SelectItem>
                    <SelectItem value="Savings">Savings</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account Number</Label>
                <div className="relative">
                  <Input
                    type={showAccount ? "text" : "password"}
                    value={bankForm.account_number}
                    onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                    placeholder={"Enter account number"}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccount((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showAccount ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBankDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleBankSave} disabled={updateMyBankTax.isPending}>
              {updateMyBankTax.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
}
