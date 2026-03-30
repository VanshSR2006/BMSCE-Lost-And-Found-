import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Tag, ShieldAlert, ArrowRightLeft, Lock } from "lucide-react";

interface HandoverVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (notificationId: string) => void;
  notification: any;
}

const HandoverVerification: React.FC<HandoverVerificationProps> = ({
  isOpen,
  onClose,
  onApprove,
  notification,
}) => {
  if (!notification) return null;

  const foundItem = notification.foundItem;
  const lostItem = notification.requesterLostItem || notification.lostItem;
  
  const isLateReport = foundItem && lostItem && new Date(lostItem.createdAt) > new Date(foundItem.createdAt);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#16052a] text-white border-white/10 max-w-4xl rounded-[2.5rem] p-0 overflow-hidden">
        <DialogHeader className="p-8 border-b border-white/5 bg-[#240e3b]/50">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-3xl font-black font-['Plus_Jakarta_Sans'] tracking-tight mb-1">Secure Claim Verification</DialogTitle>
              <p className="text-purple-200/50 text-sm">Compare signatures before initiating neural link.</p>
            </div>
            {isLateReport && (
              <Badge className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest animate-pulse">
                ⚠️ Late Report Warning
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8">
          {/* COMPARISON GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
              <div className="w-12 h-12 rounded-full bg-[#16052a] border border-white/10 flex items-center justify-center shadow-2xl">
                <ArrowRightLeft className="text-[#4af8e3] h-5 w-5" />
              </div>
            </div>

            {/* LEFT: FOUND ITEM (YOURS) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#4af8e3]"></div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#4af8e3]">Found Record (Reference)</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                <h4 className="text-xl font-bold">{foundItem?.title}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-purple-200/50"><MapPin size={14}/> {foundItem?.location}</div>
                  <div className="flex items-center gap-2 text-xs text-purple-200/50"><Calendar size={14}/> {new Date(foundItem?.date).toLocaleDateString()}</div>
                </div>
                <p className="text-sm text-purple-100/60 leading-relaxed italic border-t border-white/5 pt-4">
                  "{foundItem?.description}"
                </p>
                <div className="mt-4 p-4 bg-[#4af8e3]/5 border border-[#4af8e3]/20 rounded-2xl flex items-start gap-3">
                  <Lock className="text-[#4af8e3] h-4 w-4 mt-0.5" />
                  <div>
                    <span className="text-[9px] uppercase font-black text-[#4af8e3] block mb-1">Your Secret Detail</span>
                    <p className="text-xs text-[#4af8e3] font-bold">{foundItem?.secretDetail || "Not specified"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: LOST ITEM (REQUESTER) */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-[#ff2e97]"></div>
                <span className="text-[10px] uppercase font-black tracking-widest text-[#ff2e97]">Lost Report (Claimant)</span>
              </div>
              <div className="bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                <h4 className="text-xl font-bold">{lostItem?.title}</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-xs text-purple-200/50"><Tag size={14}/> {lostItem?.category}</div>
                  <div className="flex items-center gap-2 text-xs text-purple-200/50"><Calendar size={14}/> {new Date(lostItem?.date).toLocaleDateString()}</div>
                </div>
                <p className="text-sm text-purple-100/60 leading-relaxed italic border-t border-white/5 pt-4">
                  "{lostItem?.description}"
                </p>
                
                {/* CHALLENGE ANSWER */}
                <div className="mt-4 p-4 bg-[#ff2e97]/10 border border-[#ff2e97]/20 rounded-2xl">
                  <span className="text-[9px] uppercase font-black text-[#ff2e97] block mb-1">Loser's Challenge Proof</span>
                  <p className="text-white text-sm font-bold leading-relaxed">{notification.challengeResponse || "No proof provided."}</p>
                </div>
              </div>
            </div>
          </div>

          {/* MISUSE WARNING */}
          {isLateReport && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-4">
              <ShieldAlert className="text-amber-500 h-6 w-6 shrink-0" />
              <p className="text-xs text-amber-500/80 leading-relaxed">
                <strong>Attention</strong>: This user reported their item as "Lost" <span className="font-bold underline">after</span> your "Found" report was already live. 
                Verify their challenge answer carefully—scammers often copy descriptors from public listings.
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="p-8 pt-0 flex gap-4">
          <Button 
            variant="outline" 
            className="flex-1 bg-white/5 border-white/10 hover:bg-red-500/20 text-white rounded-2xl h-14 font-bold"
            onClick={onClose}
          >
            Discard Request
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-[#6200EE] to-[#4af8e3] text-white rounded-2xl h-14 font-black uppercase tracking-widest shadow-xl shadow-purple-900/30"
            onClick={() => onApprove(notification._id)}
          >
            Authorize Chat Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HandoverVerification;
