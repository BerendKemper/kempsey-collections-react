

import "./ShopCard.css";



interface ProductCardProps {
  title: string;
  artist: string;
  price?: number;
  imageUrl: string;
}



export function ShopCard({ title, artist, price, imageUrl }: ProductCardProps) {
  return (
    <div className="card">
      <img src={imageUrl} alt={title} className="card-img" />
      <h3>{title}</h3>
      <p>{artist}</p>
      {price !== undefined && <strong>€{price}</strong>}
    </div>
  );
}
