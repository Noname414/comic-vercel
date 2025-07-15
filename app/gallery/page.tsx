'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabaseClient';
import { ComicStyle, PanelScript } from '@/types/comic';

interface Comic {
  id: number;
  created_at: string;
  prompt: string;
  style: ComicStyle;
  images: string[];
  scripts: PanelScript[];
}

export default function Gallery() {
  const [comics, setComics] = useState<Comic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchComics() {
      try {
        const { data, error } = await supabase
          .from('comics')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setComics(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch comics');
      } finally {
        setLoading(false);
      }
    }

    fetchComics();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 relative overflow-hidden">
      <div className="relative z-10 container mx-auto py-12 px-4">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 mb-4 leading-tight">
            Comic Gallery
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto mb-8 leading-relaxed">
            Browse comics created by the community.
          </p>
        </header>

        {loading && (
          <div className="text-center">
            <p className="text-lg text-gray-700">Loading comics...</p>
          </div>
        )}

        {error && (
          <div className="text-center">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {comics.map((comic) => (
              <div key={comic.id} className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/30 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{comic.prompt}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {comic.images.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg bg-white shadow-md">
                      <Image
                        src={`data:image/png;base64,${image}`}
                        alt={`Comic panel ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Style:</strong> {comic.style}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
