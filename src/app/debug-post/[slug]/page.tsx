import { getPostBySlug } from '@/services/api'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DebugPostPage({ params }: { params: { slug: string } }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const fullUrl = `${apiUrl}/posts/slug/${params.slug}`
  
  let post
  let error
  let fetchResponse
  
  try {
    // Test direct fetch
    const res = await fetch(fullUrl, { cache: 'no-store' })
    fetchResponse = {
      status: res.status,
      ok: res.ok,
      statusText: res.statusText,
    }
    
    if (res.ok) {
      post = await res.json()
    } else {
      error = `HTTP ${res.status}: ${res.statusText}`
    }
  } catch (e: any) {
    error = e.message
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">Debug Post Page</h1>
        
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Request Info</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{JSON.stringify({
  slug: params.slug,
  apiUrl,
  fullUrl,
  timestamp: new Date().toISOString(),
}, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Fetch Response</h2>
            <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto">
{JSON.stringify(fetchResponse, null, 2)}
            </pre>
          </div>
          
          {error && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
              <pre className="bg-red-100 text-red-800 p-4 rounded overflow-x-auto">
{error}
              </pre>
            </div>
          )}
          
          {post && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">Post Data</h2>
              <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-sm">
{JSON.stringify(post, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-8 pt-4 border-t">
            <a 
              href={`/posts/${params.slug}`}
              className="text-blue-600 hover:underline"
            >
              → Try accessing the real post page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
