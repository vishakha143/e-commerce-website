export function PaymentMethod() {
  return (
    <div className="flex flex-col gap-3 p-6 bg-card border border-border rounded-lg">
      <h2 className="font-display text-xl font-bold text-foreground">Payment method</h2>
      <label className="flex items-center gap-3 p-3.5 border border-foreground rounded-md">
        <input type="radio" name="paymentMethod" value="cod" checked readOnly className="accent-foreground" />
        <div>
          <div className="text-sm font-medium text-foreground">Cash on Delivery</div>
          <div className="text-xs text-muted-foreground">Pay when your order arrives.</div>
        </div>
      </label>
      <p className="text-xs text-muted-foreground">More payment options will be available soon.</p>
    </div>
  );
}
