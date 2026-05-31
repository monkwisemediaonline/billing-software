"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, CreditCard, ArrowLeft } from "lucide-react";

type Props = {
  invoiceId: string;
  totalAmount: number;
  dueAmount: number;
  paymentStatus: string;
};

export default function InvoiceActions({
  invoiceId,
  totalAmount,
  dueAmount,
  paymentStatus,
}: Props) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [loading, setLoading] = useState(false);

  async function handlePayment() {
    const paid = Number(amountPaid);
    if (!paid || paid <= 0) {
      alert("Enter a valid amount");
      return;
    }
    if (paid > dueAmount) {
      alert("Amount exceeds due amount ₹" + dueAmount);
      return;
    }

    setLoading(true);

    const newDue = dueAmount - paid;
    const newStatus =
      newDue === 0 ? "Paid" : "Partial";

    const { createClient } = await import("@/lib/client").catch(
      async () => await import("@/lib/supabase").then((m) => ({ createClient: () => m.supabase }))
    );
    const supabase = createClient();

    const { error } = await supabase
      .from("invoices")
      .update({
        due_amount: newDue,
        payment_status: newStatus,
      })
      .eq("id", invoiceId);

    if (error) {
      alert("Failed: " + error.message);
      setLoading(false);
      return;
    }

    // Save payment record
    await supabase.from("payments").insert([{
      invoice_id: invoiceId,
      amount_paid: paid,
      payment_date: new Date().toISOString().split("T")[0],
    }]);

    setLoading(false);
    setShowModal(false);
    alert(newStatus === "Paid" ? "Invoice marked as Paid!" : `Payment of ₹${paid} recorded. Due: ₹${newDue}`);
    router.refresh();
  }

  return (
    <>
      {/* Action Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm hover:bg-gray-50"
        >
          <Printer size={16} />
          Print
        </button>

        {paymentStatus !== "Paid" && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
          >
            <CreditCard size={16} />
            Record Payment
          </button>
        )}

        {paymentStatus === "Paid" && (
          <span className="rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            ✓ Fully Paid
          </span>
        )}
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
            <h2 className="mb-1 text-2xl font-bold">Record Payment</h2>
            <p className="mb-6 text-gray-500">
              Due amount: <span className="font-semibold text-red-500">₹{dueAmount}</span>
            </p>

            <label className="mb-2 block text-sm font-medium text-gray-700">
              Amount Received (₹)
            </label>
            <input
              type="number"
              placeholder={`Max ₹${dueAmount}`}
              className="mb-6 w-full rounded-xl border p-4 outline-none focus:border-black"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border py-3 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 rounded-xl bg-black py-3 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {loading ? "Saving..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}