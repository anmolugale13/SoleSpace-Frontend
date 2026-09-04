import { Link } from "react-router-dom";
import { products } from "../data/products";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

export default function Wishlist() {
  const { ids } = useWishlist();
  const items = products.filter((p) => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="container-x py-24 text-center">
        <p className="font-display text-3xl mb-3">Your wishlist is empty</p>
        <p className="text-graphite mb-8">Save pairs you're eyeing — they'll sync here across sessions.</p>
        <Link to="/shop" className="btn-primary">Browse shoes</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-4xl mb-8">Wishlist</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {items.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
