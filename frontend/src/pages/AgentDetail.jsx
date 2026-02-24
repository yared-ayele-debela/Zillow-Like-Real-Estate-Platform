import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { StarIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { agentService } from '../services/agentService';

const getAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (avatar.startsWith('http')) return avatar;
  return `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${avatar}`;
};

const AgentDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') || '';
  const page = Number(searchParams.get('page') || 1);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['agent-detail', id, status, page],
    queryFn: () =>
      agentService.getAgentDetail(id, {
        page,
        per_page: 12,
        ...(status ? { status } : {}),
      }),
    enabled: Boolean(id),
  });

  const agent = data?.agent;
  const properties = data?.properties?.data || [];
  const pagination = data?.properties || {};
  const stats = data?.stats || {};
  const rating = data?.rating_summary || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error?.response?.data?.message || 'Agent details not found'}
        </div>
        <Link to="/properties" className="inline-block mt-4 text-luxury-gold hover:text-luxury-gold">
          ← Back to Properties
        </Link>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(agent.avatar);

  return (
    <div className="min-h-screen bg-luxury-charcoal">
      <div className="container mx-auto px-4 py-8">
        <Link to="/properties" className="inline-block mb-6 text-luxury-gold hover:text-luxury-gold">
          ← Back to Properties
        </Link>

        <div className="bg-luxury-navy rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-luxury-charcoal overflow-hidden flex items-center justify-center text-3xl font-bold text-luxury-warm">
              {avatarUrl ? (
                <img src={avatarUrl} alt={agent.name} className="w-full h-full object-cover" />
              ) : (
                (agent.name || 'A').charAt(0).toUpperCase()
              )}
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold text-luxury-warm">{agent.name}</h1>
                {agent.is_verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>
              {agent.company_name && (
                <p className="text-luxury-gold mt-1 font-medium">{agent.company_name}</p>
              )}
              <p className="text-luxury-warm/70 text-sm mt-1">
                Joined {new Date(agent.created_at).toLocaleDateString()}
              </p>
              {agent.bio && <p className="mt-4 text-luxury-warm/80">{agent.bio}</p>}
            </div>

            <div className="min-w-[240px] bg-luxury-charcoal rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-luxury-warm/80">
                <StarIcon className="w-5 h-5 text-yellow-400" />
                <span className="font-semibold text-luxury-warm">
                  {rating.average_rating || 0} / 5
                </span>
                <span className="text-sm">({rating.total_reviews || 0} reviews)</span>
              </div>
              {agent.phone && (
                <div className="flex items-center gap-2 text-luxury-warm/80">
                  <PhoneIcon className="w-5 h-5" />
                  <span>{agent.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-luxury-warm/80">
                <EnvelopeIcon className="w-5 h-5" />
                <span>{agent.email}</span>
              </div>
              {agent.license_number && (
                <div className="text-sm text-luxury-warm/70">
                  License: {agent.license_number}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-luxury-navy rounded-lg p-4">
            <p className="text-luxury-warm/60 text-sm">Total</p>
            <p className="text-2xl font-bold text-luxury-gold">{stats.total_properties || 0}</p>
          </div>
          <div className="bg-luxury-navy rounded-lg p-4">
            <p className="text-luxury-warm/60 text-sm">For Sale</p>
            <p className="text-2xl font-bold text-luxury-gold">{stats.for_sale || 0}</p>
          </div>
          <div className="bg-luxury-navy rounded-lg p-4">
            <p className="text-luxury-warm/60 text-sm">For Rent</p>
            <p className="text-2xl font-bold text-luxury-gold">{stats.for_rent || 0}</p>
          </div>
          <div className="bg-luxury-navy rounded-lg p-4">
            <p className="text-luxury-warm/60 text-sm">Sold</p>
            <p className="text-2xl font-bold text-luxury-gold">{stats.sold || 0}</p>
          </div>
          <div className="bg-luxury-navy rounded-lg p-4">
            <p className="text-luxury-warm/60 text-sm">Featured</p>
            <p className="text-2xl font-bold text-luxury-gold">{stats.featured || 0}</p>
          </div>
          <div className="bg-luxury-navy rounded-lg p-4">
            <p className="text-luxury-warm/60 text-sm">Avg Price</p>
            <p className="text-xl font-bold text-luxury-gold">
              ${Number(stats.average_price || 0).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-luxury-warm">Agent Properties</h2>
          <div className="flex items-center gap-2">
            <label className="text-sm text-luxury-warm/70">Filter:</label>
            <select
              value={status}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams);
                if (e.target.value) {
                  params.set('status', e.target.value);
                } else {
                  params.delete('status');
                }
                params.set('page', '1');
                setSearchParams(params);
              }}
              className="px-3 py-2 border border-luxury-gold/30 rounded-md bg-luxury-navy text-luxury-warm"
            >
              <option value="">All</option>
              <option value="for_sale">For Sale</option>
              <option value="for_rent">For Rent</option>
              <option value="sold">Sold</option>
            </select>
          </div>
        </div>

        {isFetching && (
          <div className="text-sm text-luxury-warm/70 mb-4">Refreshing properties...</div>
        )}

        {properties.length === 0 ? (
          <div className="bg-luxury-navy rounded-lg p-8 text-center text-luxury-warm/70">
            No properties found for this filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {properties.map((property) => {
              const primaryImage =
                property.images?.find((img) => img.is_primary) || property.images?.[0];
              const imageUrl = primaryImage
                ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${primaryImage.image_path}`
                : '/placeholder-property.jpg';

              return (
                <Link
                  key={property.id}
                  to={`/properties/${property.id}`}
                  className="bg-luxury-navy rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="h-44 bg-luxury-charcoal">
                    {primaryImage ? (
                      <img src={imageUrl} alt={property.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-luxury-warm/40">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-luxury-warm line-clamp-1">{property.title}</h3>
                    <p className="text-luxury-gold text-xl font-bold mt-2">
                      {property.formatted_price || `$${Number(property.price).toLocaleString()}`}
                    </p>
                    <div className="flex items-center gap-1 text-luxury-warm/70 mt-2 text-sm">
                      <MapPinIcon className="w-4 h-4" />
                      <span className="line-clamp-1">{property.city}, {property.state}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-luxury-gold/20 flex gap-4 text-sm text-luxury-warm/70">
                      <span>{property.bedrooms || 0} beds</span>
                      <span>{property.bathrooms || 0} baths</span>
                      <span>{Number(property.square_feet || 0).toLocaleString()} sqft</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {pagination.last_page > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              disabled={pagination.current_page <= 1}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(Math.max(1, pagination.current_page - 1)));
                setSearchParams(params);
              }}
              className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-luxury-navy"
            >
              Previous
            </button>
            <span className="text-luxury-warm/70 text-sm">
              Page {pagination.current_page} of {pagination.last_page}
            </span>
            <button
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(Math.min(pagination.last_page, pagination.current_page + 1)));
                setSearchParams(params);
              }}
              className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-luxury-navy"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentDetail;

