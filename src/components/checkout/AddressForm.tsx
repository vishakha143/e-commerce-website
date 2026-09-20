const inputClass =
  "px-3.5 py-3 border border-border rounded-md text-sm text-foreground focus:outline-none focus:border-foreground";

export function AddressForm() {
  return (
    <div className="flex flex-col gap-4 p-6 bg-card border border-border rounded-lg">
      <h2 className="text-lg font-bold text-foreground">Shipping Address</h2>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Full Name</span>
        <input type="text" name="name" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Address</span>
        <input type="text" name="address" required className={inputClass} />
      </label>

      <div className="flex gap-3">
        <label className="flex-1 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">City</span>
          <input type="text" name="city" required className={inputClass} />
        </label>
        <label className="w-[120px] shrink-0 flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Zip Code</span>
          <input type="text" name="pincode" required className={inputClass} />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">State</span>
        <input type="text" name="state" required className={inputClass} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-foreground">Phone</span>
        <input type="tel" name="phone" required className={inputClass} />
      </label>
    </div>
  );
}
