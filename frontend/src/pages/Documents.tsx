import { useRef, useState } from "react";
import { HRLayout } from "@/components/HRLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, FileText, Search, Download, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDocuments, useUploadDocument, useDeleteDocument, downloadDocument } from "@/hooks/api/useDocuments";

const Documents = () => {
  const [search, setSearch] = useState("");
  const { data: docs = [], isLoading } = useDocuments(search);
  const uploadDocument = useUploadDocument();
  const deleteDocument = useDeleteDocument();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [docType, setDocType] = useState("Contract");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const employees = [...new Set(docs.map((d) => d.employee))];

  const grouped = docs.reduce<Record<string, typeof docs>>((acc, doc) => {
    if (!acc[doc.employee]) acc[doc.employee] = [];
    acc[doc.employee].push(doc);
    return acc;
  }, {});

  const handleUpload = () => {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      toast({ title: "Please select a file", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", file.name);
    formData.append("type", docType);
    uploadDocument.mutate(formData, {
      onSuccess: () => {
        toast({ title: "Document uploaded" });
        setDialogOpen(false);
        if (fileRef.current) fileRef.current.value = "";
      },
      onError: () => toast({ title: "Upload failed", variant: "destructive" }),
    });
  };

  const handleDelete = (id: number) => {
    deleteDocument.mutate(id, {
      onSuccess: () => toast({ title: "Document removed" }),
      onError: () => toast({ title: "Failed to delete document", variant: "destructive" }),
    });
  };

  return (
    <HRLayout
      title="Documents"
      subtitle="Employee documents and records"
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Upload Document
        </Button>
      }
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documents..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([employee, employeeDocs]) => (
            <div key={employee} className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-secondary/30">
                <h2 className="font-semibold text-card-foreground">{employee}</h2>
                <p className="text-xs text-muted-foreground">{employeeDocs.length} document{employeeDocs.length > 1 ? "s" : ""}</p>
              </div>
              <div className="divide-y divide-border">
                {employeeDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary"><FileText className="h-4 w-4 text-muted-foreground" /></div>
                      <div>
                        <p className="text-sm font-medium text-card-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.type} · {doc.uploadedDate} · {doc.size}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge label={doc.status} variant={doc.status === "Active" ? "success" : "warning"} />
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => downloadDocument(doc.id, doc.title)}><Download className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(doc.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {employees.length === 0 && (
            <p className="text-center text-muted-foreground py-12">No documents found.</p>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Upload Document</DialogTitle><DialogDescription>Select a file and provide document details.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>File *</Label>
              <Input type="file" ref={fileRef} />
            </div>
            <div className="space-y-2">
              <Label>Document Type</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Legal">Legal</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Certificate">Certificate</SelectItem>
                  <SelectItem value="Policy">Policy</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploadDocument.isPending}>
              {uploadDocument.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </HRLayout>
  );
};

export default Documents;
