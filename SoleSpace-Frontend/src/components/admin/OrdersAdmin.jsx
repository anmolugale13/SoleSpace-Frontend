import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const fmt = (n) => `₹${n.toLocaleString("en-IN")}`;
const API_URL = "http://localhost:5000/api";

const STATUSES = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested', 'Returned'];

export default function OrdersAdmin() {
  const { token } = useAuth();
  const { push } = useToast();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState("details"); // details, shipment, notes, history
  
  // Actions
  const [noteInput, setNoteInput] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/orders/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      push(err.message || "Error fetching orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setOrders(orders.map(o => o._id === orderId ? updated : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      push(`Status updated to ${newStatus}`);
    } catch (err) {
      push(err.message || "Error updating status");
    }
  };

  const createShipment = async (orderId) => {
    if (!trackingNumber || !carrier) return push("Please enter carrier and tracking number");
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/shipment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ trackingNumber, carrier })
      });
      if (!res.ok) throw new Error("Failed to create shipment");
      const updated = await res.json();
      setOrders(orders.map(o => o._id === orderId ? updated : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      setTrackingNumber("");
      setCarrier("");
      push("Shipment created successfully");
    } catch (err) {
      push(err.message || "Error creating shipment");
    }
  };

  const addNote = async (orderId) => {
    if (!noteInput.trim()) return;
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note: noteInput })
      });
      if (!res.ok) throw new Error("Failed to add note");
      const updated = await res.json();
      setOrders(orders.map(o => o._id === orderId ? updated : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      setNoteInput("");
      push("Note added");
    } catch (err) {
      push(err.message || "Error adding note");
    }
  };

  const processReturn = async (orderId, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this return?`)) return;
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}/return`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error("Failed to process return");
      const updated = await res.json();
      setOrders(orders.map(o => o._id === orderId ? updated : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(updated);
      }
      push(`Return ${status}`);
    } catch (err) {
      push(err.message || "Error processing return");
    }
  };

  const cancelOrder = (orderId) => {
    if (window.confirm("Are you sure you want to cancel this order? It will also initiate a refund if applicable.")) {
      updateStatus(orderId, 'Cancelled');
    }
  };

  const generateInvoice = (order) => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
        <head>
          <title>Invoice - ${order._id}</title>
          <style>
            body { font-family: system-ui; padding: 40px; color: #111; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>SoleSpace</h2>
              <p>Invoice / Packing Slip</p>
            </div>
            <div style="text-align: right;">
              <p>Order ID: <b>${order._id}</b></p>
              <p>Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <h3>Customer Info</h3>
            <p>${order.user ? order.user.name : 'Guest'}</p>
            <p>${order.user ? order.user.email : ''}</p>
            <p>${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}</p>
          </div>
          <table>
            <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>
              ${order.orderItems.map(i => `<tr><td>${i.name} ${i.sku ? `(${i.sku})` : ''}</td><td>${i.qty}</td><td>${fmt(i.price)}</td></tr>`).join('')}
            </tbody>
            <tfoot>
              <tr><td colspan="2" style="text-align:right">Shipping</td><td>${fmt(order.shippingPrice)}</td></tr>
              <tr><td colspan="2" style="text-align:right">Tax</td><td>${fmt(order.taxPrice)}</td></tr>
              <tr><td colspan="2" style="text-align:right; font-weight:bold">Total</td><td style="font-weight:bold">${fmt(order.totalPrice)}</td></tr>
            </tfoot>
          </table>
          <script>window.print()</script>
        </body>
      </html>
    `);
    w.document.close();
  };

  const exportCSV = () => {
    const headers = ["Order ID", "Date", "Customer", "Email", "Total", "Status"];
    const rows = filteredOrders.map(o => [
      o._id,
      new Date(o.createdAt).toISOString(),
      o.user?.name || "Guest",
      o.user?.email || "",
      o.totalPrice,
      o.status
    ]);
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchSearch = o._id.includes(search) || (o.user?.name || "").toLowerCase().includes(search.toLowerCase()) || (o.user?.email || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, search, statusFilter]);

  if (loading) return <div className="p-10 text-center text-graphite">Loading orders...</div>;

  return (
    <div>
      <div className="flex flex-wrap gap-4 justify-between mb-6">
        <div className="flex gap-2 flex-1 min-w-[300px]">
          <input 
            type="text" 
            placeholder="Search by ID, name, email..." 
            className="input max-w-sm" 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
          <select 
            className="input max-w-[200px]" 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={exportCSV} className="btn-secondary">Export CSV</button>
      </div>

      <div className="overflow-x-auto border border-ink/15 bg-white">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-haze">
            <tr className="text-left label-eyebrow">
              <th className="p-4">Order ID</th>
              <th className="p-4">Date</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {filteredOrders.length === 0 ? (
              <tr><td colSpan="6" className="p-10 text-center text-graphite">No orders found.</td></tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o._id} className="hover:bg-haze/30 transition-colors">
                  <td className="p-4 font-mono text-xs">{o._id.substring(o._id.length - 8)}</td>
                  <td className="p-4 text-graphite">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">{o.user?.name || "Guest"}</td>
                  <td className="p-4 font-mono font-medium">{fmt(o.totalPrice)}</td>
                  <td className="p-4">
                    <span className={`stamp ${o.status === 'Cancelled' ? 'bg-cone/10 text-cone' : o.status === 'Delivered' ? 'bg-green-100 text-green-700' : ''}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    <button onClick={() => setSelectedOrder(o)} className="stitch text-xs">Manage</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 overflow-y-auto backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="border-b border-ink/10 p-6 flex justify-between items-center bg-haze/30">
              <div>
                <p className="label-eyebrow mb-1">Order Details</p>
                <h2 className="font-display text-2xl font-mono">{selectedOrder._id}</h2>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-2xl text-graphite hover:text-ink">&times;</button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              
              {/* Quick Actions & Status */}
              <div className="flex flex-wrap gap-4 justify-between items-center bg-haze p-4 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Update Status:</span>
                  <select 
                    className="input py-1.5" 
                    value={selectedOrder.status}
                    onChange={(e) => updateStatus(selectedOrder._id, e.target.value)}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => generateInvoice(selectedOrder)} className="btn-secondary py-2">Invoice / Slip</button>
                  {(selectedOrder.status !== 'Cancelled' && selectedOrder.status !== 'Returned') && (
                    <button onClick={() => cancelOrder(selectedOrder._id)} className="border border-cone text-cone px-4 py-2 text-xs font-mono uppercase tracking-wider hover:bg-cone hover:text-white transition-colors">Cancel Order</button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b border-ink/10 mb-6">
                {['details', 'shipment', 'notes', 'history'].map(tab => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 text-sm font-mono uppercase tracking-wider ${activeTab === tab ? 'border-b-2 border-ink text-ink font-bold' : 'text-graphite'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              {activeTab === 'details' && (
                <div className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <p className="label-eyebrow mb-3">Customer Information</p>
                      <div className="bg-haze/30 p-4 border border-ink/5 text-sm space-y-1">
                        <p><span className="text-graphite w-24 inline-block">Name:</span> {selectedOrder.user?.name || "Guest"}</p>
                        <p><span className="text-graphite w-24 inline-block">Email:</span> {selectedOrder.user?.email || "N/A"}</p>
                        <p><span className="text-graphite w-24 inline-block">Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                        <p><span className="text-graphite w-24 inline-block">Payment:</span> {selectedOrder.isPaid ? 'Paid' : 'Unpaid'} {selectedOrder.paymentMethod ? `(${selectedOrder.paymentMethod})` : ''}</p>
                      </div>
                    </div>
                    <div>
                      <p className="label-eyebrow mb-3">Shipping Address</p>
                      <div className="bg-haze/30 p-4 border border-ink/5 text-sm">
                        {selectedOrder.shippingAddress ? (
                          <>
                            <p>{selectedOrder.shippingAddress.address}</p>
                            <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.postalCode}</p>
                            <p>{selectedOrder.shippingAddress.country}</p>
                          </>
                        ) : (
                          <p className="text-graphite">No shipping address provided.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="label-eyebrow mb-3">Order Items</p>
                    <table className="w-full text-sm border border-ink/10">
                      <thead className="bg-haze text-left">
                        <tr><th className="p-3">Product</th><th className="p-3">Qty</th><th className="p-3 text-right">Price</th><th className="p-3 text-right">Total</th></tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5">
                        {selectedOrder.orderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 flex items-center gap-3">
                              {item.image && <img src={item.image} alt="" className="w-10 h-10 object-cover bg-haze" />}
                              <div>
                                <p>{item.name}</p>
                                {item.sku && <p className="text-xs text-graphite">SKU: {item.sku}</p>}
                              </div>
                            </td>
                            <td className="p-3">{item.qty}</td>
                            <td className="p-3 text-right">{fmt(item.price)}</td>
                            <td className="p-3 text-right">{fmt(item.price * item.qty)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="mt-4 flex justify-end">
                      <div className="w-64 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-graphite">Subtotal</span><span>{fmt(selectedOrder.totalPrice - selectedOrder.shippingPrice - selectedOrder.taxPrice)}</span></div>
                        <div className="flex justify-between"><span className="text-graphite">Shipping</span><span>{fmt(selectedOrder.shippingPrice)}</span></div>
                        <div className="flex justify-between"><span className="text-graphite">Tax</span><span>{fmt(selectedOrder.taxPrice)}</span></div>
                        <div className="flex justify-between font-bold pt-2 border-t border-ink/10 text-base"><span>Total</span><span>{fmt(selectedOrder.totalPrice)}</span></div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.returnRequest && (
                    <div className="border border-cone/30 p-4 bg-cone/5">
                      <p className="label-eyebrow text-cone mb-2">Return Request ({selectedOrder.returnRequest.status})</p>
                      <p className="text-sm mb-3">Reason: {selectedOrder.returnRequest.reason}</p>
                      {selectedOrder.returnRequest.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => processReturn(selectedOrder._id, 'Approved')} className="btn-primary py-1 px-3 text-xs">Approve Return</button>
                          <button onClick={() => processReturn(selectedOrder._id, 'Rejected')} className="btn-secondary py-1 px-3 text-xs">Reject Return</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'shipment' && (
                <div className="space-y-6">
                  <div className="border border-ink/10 p-5 bg-haze/20">
                    <p className="font-display text-lg mb-4">Create / Update Shipment</p>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-graphite mb-1">Carrier</label>
                        <input type="text" className="input" placeholder="e.g. FedEx, BlueDart" value={carrier} onChange={e => setCarrier(e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs uppercase tracking-widest text-graphite mb-1">Tracking Number</label>
                        <input type="text" className="input" placeholder="Tracking ID" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} />
                      </div>
                    </div>
                    <button onClick={() => createShipment(selectedOrder._id)} className="btn-primary">Save Shipment</button>
                  </div>

                  {selectedOrder.shipmentInfo?.trackingNumber ? (
                    <div>
                      <p className="label-eyebrow mb-3">Current Shipment Info</p>
                      <div className="bg-haze p-4 text-sm">
                        <p><span className="text-graphite w-32 inline-block">Carrier:</span> {selectedOrder.shipmentInfo.carrier}</p>
                        <p><span className="text-graphite w-32 inline-block">Tracking Number:</span> <span className="font-mono">{selectedOrder.shipmentInfo.trackingNumber}</span></p>
                        <p><span className="text-graphite w-32 inline-block">Shipped At:</span> {new Date(selectedOrder.shipmentInfo.shippedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-graphite text-sm">No shipment information recorded yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div>
                  <div className="mb-6">
                    <p className="label-eyebrow mb-2">Add Internal Note</p>
                    <textarea 
                      className="input min-h-[100px] mb-3" 
                      placeholder="Only visible to admins..."
                      value={noteInput}
                      onChange={e => setNoteInput(e.target.value)}
                    ></textarea>
                    <button onClick={() => addNote(selectedOrder._id)} className="btn-primary">Add Note</button>
                  </div>
                  
                  <div>
                    <p className="label-eyebrow mb-3">Previous Notes</p>
                    {(!selectedOrder.internalNotes || selectedOrder.internalNotes.length === 0) ? (
                      <p className="text-sm text-graphite">No internal notes for this order.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedOrder.internalNotes.slice().reverse().map((note, idx) => (
                          <div key={idx} className="border border-ink/10 p-4 bg-haze/10">
                            <p className="text-sm mb-2">{note.note}</p>
                            <p className="text-xs text-graphite">By {note.author} on {new Date(note.createdAt).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'history' && (
                <div>
                  <p className="label-eyebrow mb-4">Status History</p>
                  <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-ink/20 before:to-transparent">
                    {(!selectedOrder.statusHistory || selectedOrder.statusHistory.length === 0) ? (
                      <p className="text-sm text-graphite relative z-10 pl-8 md:pl-0 md:text-center">No history recorded.</p>
                    ) : (
                      selectedOrder.statusHistory.slice().reverse().map((hist, idx) => (
                        <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full border-2 border-white bg-ink shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow absolute left-0 md:left-1/2 -translate-x-1/2"></div>
                          <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] bg-haze p-4 shadow">
                            <p className="text-sm font-medium mb-1">{hist.previousStatus || 'Created'} &rarr; <span className="text-ink">{hist.newStatus}</span></p>
                            <p className="text-xs text-graphite">By {hist.user} • {new Date(hist.date).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
