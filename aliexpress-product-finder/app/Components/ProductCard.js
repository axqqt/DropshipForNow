import Image from "next/image";

export default function ProductCard({ product }) {
    return (
      <div className="border rounded p-4 w-[350px]" key={(product.url).slice(0, 25)}>
        <Image src={product.image} alt={product.name}sizes="300px"
              width={500}
              height={300}
         />
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-gray-600">${product.price}</p>
        <p className="mt-2">AI Score: {product.aiScore}/10</p>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-blue-500"
        >
          View on AliExpress
        </a>
      </div>
    );
  }