import { useEffect, useState } from 'react';
import { CogIcon, EnvelopeIcon, CreditCardIcon, MapPinIcon } from '@heroicons/react/24/outline';
import AdminLayout from '../components/admin/AdminLayout';
import paymentService from '../services/paymentService';
import adminService from '../services/adminService';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('site');
  const [settings, setSettings] = useState({
    site: {
      site_name: 'Zillow Clone',
      site_description: 'Real Estate Platform',
      maintenance_mode: false,
      allow_registration: true,
      require_email_verification: true,
    },
    email: {
      mail_driver: 'smtp',
      mail_host: 'smtp.mailtrap.io',
      mail_port: '2525',
      mail_username: '',
      mail_password: '',
      mail_from_address: 'noreply@example.com',
      mail_from_name: 'Zillow Clone',
    },
    payment: {
      payment_gateway: 'stripe',
      stripe_key: '',
      stripe_secret: '',
      paypal_client_id: '',
      paypal_secret: '',
    },
    locations: {
      cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'],
      states: ['NY', 'CA', 'IL', 'TX', 'AZ'],
    },
  });
  const [plans, setPlans] = useState([]);
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [newPlanFeature, setNewPlanFeature] = useState('');
  const [newPlan, setNewPlan] = useState({
    name: '',
    slug: '',
    price: '',
    stripe_price_id: '',
    features: [],
    is_active: true,
    sort_order: 0,
  });
  const [newPackage, setNewPackage] = useState({
    name: '',
    duration_days: '',
    price: '',
    is_active: true,
    sort_order: 0,
  });
  const [locations, setLocations] = useState([]);
  const [locationForm, setLocationForm] = useState({
    state: '',
    city: '',
    sort_order: 0,
    is_active: true,
  });
  const [editingLocationId, setEditingLocationId] = useState(null);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSection, setSavingSection] = useState('');

  useEffect(() => {
    fetchAdminSettings();
    fetchPaymentConfigs();
    fetchLocations();
  }, []);

  const fetchAdminSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await adminService.getSettings();
      setSettings((prev) => ({
        ...prev,
        site: {
          ...prev.site,
          ...(data?.site || {}),
        },
        email: {
          ...prev.email,
          ...(data?.email || {}),
        },
      }));
    } catch (error) {
      console.error('Failed to load admin settings:', error);
      alert(error.response?.data?.message || 'Failed to load admin settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSave = async (section) => {
    try {
      setSavingSection(section);
      if (section === 'site') {
        await adminService.updateSiteSettings(settings.site);
        alert('Site settings saved successfully');
      } else if (section === 'email') {
        await adminService.updateEmailSettings(settings.email);
        alert('Email settings saved successfully');
      } else if (section === 'payment') {
        alert('Payment settings use dynamic plan/package managers below');
      } else if (section === 'locations') {
        alert('Locations are saved per action (add/edit/delete)');
      }
    } catch (error) {
      alert(error.response?.data?.message || `Failed to save ${section} settings`);
    } finally {
      setSavingSection('');
    }
  };

  const fetchPaymentConfigs = async () => {
    try {
      const [plansData, packagesData] = await Promise.all([
        paymentService.getAdminPlans(),
        paymentService.getAdminFeaturedPackages(),
      ]);
      setPlans(plansData || []);
      setFeaturedPackages(packagesData || []);
    } catch (error) {
      console.error('Failed to load payment configs:', error);
    }
  };

  const addPlanFeature = () => {
    if (!newPlanFeature.trim()) return;
    setNewPlan((prev) => ({ ...prev, features: [...prev.features, newPlanFeature.trim()] }));
    setNewPlanFeature('');
  };

  const removePlanFeature = (idx) => {
    setNewPlan((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }));
  };

  const createPlan = async () => {
    try {
      await paymentService.createAdminPlan({
        ...newPlan,
        price: Number(newPlan.price),
      });
      setNewPlan({
        name: '',
        slug: '',
        price: '',
        stripe_price_id: '',
        features: [],
        is_active: true,
        sort_order: 0,
      });
      fetchPaymentConfigs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create plan');
    }
  };

  const createFeaturedPackage = async () => {
    try {
      await paymentService.createAdminFeaturedPackage({
        ...newPackage,
        duration_days: Number(newPackage.duration_days),
        price: Number(newPackage.price),
      });
      setNewPackage({
        name: '',
        duration_days: '',
        price: '',
        is_active: true,
        sort_order: 0,
      });
      fetchPaymentConfigs();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create featured package');
    }
  };

  const togglePlanActive = async (plan) => {
    await paymentService.updateAdminPlan(plan.id, { is_active: !plan.is_active });
    fetchPaymentConfigs();
  };

  const togglePackageActive = async (pkg) => {
    await paymentService.updateAdminFeaturedPackage(pkg.id, { is_active: !pkg.is_active });
    fetchPaymentConfigs();
  };

  const fetchLocations = async () => {
    try {
      setLoadingLocations(true);
      const data = await adminService.getLocations();
      setLocations(data?.locations || []);
    } catch (error) {
      console.error('Failed to load locations:', error);
      alert(error.response?.data?.message || 'Failed to load locations');
    } finally {
      setLoadingLocations(false);
    }
  };

  const resetLocationForm = () => {
    setLocationForm({
      state: '',
      city: '',
      sort_order: 0,
      is_active: true,
    });
    setEditingLocationId(null);
  };

  const saveLocation = async () => {
    const payload = {
      state: locationForm.state.trim(),
      city: locationForm.city.trim(),
      sort_order: Number(locationForm.sort_order) || 0,
      is_active: Boolean(locationForm.is_active),
    };

    if (!payload.state || !payload.city) {
      alert('State and city are required');
      return;
    }

    try {
      setSavingLocation(true);
      if (editingLocationId) {
        await adminService.updateLocation(editingLocationId, payload);
      } else {
        await adminService.createLocation(payload);
      }
      resetLocationForm();
      fetchLocations();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save location');
    } finally {
      setSavingLocation(false);
    }
  };

  const editLocation = (location) => {
    setEditingLocationId(location.id);
    setLocationForm({
      state: location.state || '',
      city: location.city || '',
      sort_order: location.sort_order ?? 0,
      is_active: Boolean(location.is_active),
    });
  };

  const deleteLocation = async (locationId) => {
    if (!window.confirm('Delete this location?')) return;
    try {
      await adminService.deleteLocation(locationId);
      fetchLocations();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete location');
    }
  };

  const toggleLocationActive = async (location) => {
    try {
      await adminService.updateLocation(location.id, { is_active: !location.is_active });
      fetchLocations();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update location');
    }
  };

  const syncLocationsFromProperties = async () => {
    try {
      const result = await adminService.syncLocations();
      fetchLocations();
      alert(`${result.created_count || 0} new locations synced from properties`);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to sync locations');
    }
  };

  const tabs = [
    { id: 'site', name: 'Site Settings', icon: CogIcon },
    { id: 'email', name: 'Email Settings', icon: EnvelopeIcon },
    { id: 'payment', name: 'Payment Settings', icon: CreditCardIcon },
    { id: 'locations', name: 'Location Management', icon: MapPinIcon },
  ];

  return (
    <AdminLayout>
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {loadingSettings && (activeTab === 'site' || activeTab === 'email') && (
              <div className="mb-4 text-sm text-gray-500">Loading settings...</div>
            )}

            {/* Site Settings */}
            {activeTab === 'site' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                  <input
                    type="text"
                    value={settings.site.site_name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        site: { ...settings.site, site_name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
                  <textarea
                    value={settings.site.site_description}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        site: { ...settings.site, site_description: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.site.maintenance_mode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          site: { ...settings.site, maintenance_mode: e.target.checked },
                        })
                      }
                      className="mr-2"
                    />
                    Maintenance Mode
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.site.allow_registration}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          site: { ...settings.site, allow_registration: e.target.checked },
                        })
                      }
                      className="mr-2"
                    />
                    Allow Registration
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={settings.site.require_email_verification}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          site: { ...settings.site, require_email_verification: e.target.checked },
                        })
                      }
                      className="mr-2"
                    />
                    Require Email Verification
                  </label>
                </div>
                <button
                  onClick={() => handleSave('site')}
                  disabled={savingSection === 'site'}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingSection === 'site' ? 'Saving...' : 'Save Site Settings'}
                </button>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mail Driver</label>
                  <select
                    value={settings.email.mail_driver}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, mail_driver: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="smtp">SMTP</option>
                    <option value="mailgun">Mailgun</option>
                    <option value="ses">Amazon SES</option>
                    <option value="postmark">Postmark</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mail Host</label>
                    <input
                      type="text"
                      value={settings.email.mail_host}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, mail_host: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mail Port</label>
                    <input
                      type="text"
                      value={settings.email.mail_port}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, mail_port: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mail Username</label>
                  <input
                    type="text"
                    value={settings.email.mail_username}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, mail_username: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mail Password</label>
                  <input
                    type="password"
                    value={settings.email.mail_password}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        email: { ...settings.email, mail_password: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Address</label>
                    <input
                      type="email"
                      value={settings.email.mail_from_address}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, mail_from_address: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Name</label>
                    <input
                      type="text"
                      value={settings.email.mail_from_name}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          email: { ...settings.email, mail_from_name: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleSave('email')}
                  disabled={savingSection === 'email'}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {savingSection === 'email' ? 'Saving...' : 'Save Email Settings'}
                </button>
              </div>
            )}

            {/* Payment Settings */}
            {activeTab === 'payment' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Gateway</label>
                  <select
                    value={settings.payment.payment_gateway}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        payment: { ...settings.payment, payment_gateway: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="stripe">Stripe</option>
                    <option value="paypal">PayPal</option>
                    <option value="square">Square</option>
                  </select>
                </div>
                {settings.payment.payment_gateway === 'stripe' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Public Key</label>
                      <input
                        type="text"
                        value={settings.payment.stripe_key}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, stripe_key: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Secret Key</label>
                      <input
                        type="password"
                        value={settings.payment.stripe_secret}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, stripe_secret: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </>
                )}
                {settings.payment.payment_gateway === 'paypal' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Client ID</label>
                      <input
                        type="text"
                        value={settings.payment.paypal_client_id}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, paypal_client_id: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Secret</label>
                      <input
                        type="password"
                        value={settings.payment.paypal_secret}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment: { ...settings.payment, paypal_secret: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </>
                )}

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Subscription Plans (Dynamic)</h3>
                  <div className="space-y-2 mb-4">
                    {plans.map((plan) => (
                      <div key={plan.id} className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <p className="font-medium">{plan.name} ({plan.slug})</p>
                          <p className="text-sm text-gray-600">${plan.price} / {plan.currency}</p>
                        </div>
                        <button
                          onClick={() => togglePlanActive(plan)}
                          className={`px-3 py-1 text-sm rounded ${plan.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                    <input
                      placeholder="Plan Name"
                      value={newPlan.name}
                      onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      placeholder="Slug (e.g. premium)"
                      value={newPlan.slug}
                      onChange={(e) => setNewPlan({ ...newPlan, slug: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      value={newPlan.price}
                      onChange={(e) => setNewPlan({ ...newPlan, price: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      placeholder="Stripe Price ID"
                      value={newPlan.stripe_price_id}
                      onChange={(e) => setNewPlan({ ...newPlan, stripe_price_id: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <input
                      placeholder="Add feature"
                      value={newPlanFeature}
                      onChange={(e) => setNewPlanFeature(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <button onClick={addPlanFeature} className="px-3 py-2 bg-gray-200 rounded-md">Add</button>
                    <button onClick={createPlan} className="px-3 py-2 bg-indigo-600 text-white rounded-md">Create Plan</button>
                  </div>
                  {newPlan.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newPlan.features.map((f, i) => (
                        <span key={i} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs">
                          {f}
                          <button onClick={() => removePlanFeature(i)} className="ml-2">x</button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Featured Packages (Dynamic)</h3>
                  <div className="space-y-2 mb-4">
                    {featuredPackages.map((pkg) => (
                      <div key={pkg.id} className="flex items-center justify-between border rounded-md p-3">
                        <div>
                          <p className="font-medium">{pkg.name}</p>
                          <p className="text-sm text-gray-600">{pkg.duration_days} days - ${pkg.price}</p>
                        </div>
                        <button
                          onClick={() => togglePackageActive(pkg)}
                          className={`px-3 py-1 text-sm rounded ${pkg.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {pkg.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      placeholder="Package Name"
                      value={newPackage.name}
                      onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      placeholder="Duration Days"
                      type="number"
                      value={newPackage.duration_days}
                      onChange={(e) => setNewPackage({ ...newPackage, duration_days: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      placeholder="Price"
                      type="number"
                      step="0.01"
                      value={newPackage.price}
                      onChange={(e) => setNewPackage({ ...newPackage, price: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <button onClick={createFeaturedPackage} className="mt-2 px-3 py-2 bg-indigo-600 text-white rounded-md">
                    Create Package
                  </button>
                </div>

                <button
                  onClick={() => handleSave('payment')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Save Payment Settings
                </button>
              </div>
            )}

            {/* Location Management */}
            {activeTab === 'locations' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm text-gray-600">
                    Manage available states and cities used in search filters and suggestions.
                  </p>
                  <button
                    onClick={syncLocationsFromProperties}
                    className="px-3 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 text-sm"
                  >
                    Sync From Properties
                  </button>
                </div>

                <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingLocationId ? 'Edit Location' : 'Add New Location'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="State (e.g. CA)"
                      value={locationForm.state}
                      onChange={(e) => setLocationForm({ ...locationForm, state: e.target.value.toUpperCase() })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="text"
                      placeholder="City (e.g. Los Angeles)"
                      value={locationForm.city}
                      onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Sort Order"
                      value={locationForm.sort_order}
                      onChange={(e) => setLocationForm({ ...locationForm, sort_order: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={locationForm.is_active}
                        onChange={(e) => setLocationForm({ ...locationForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={saveLocation}
                      disabled={savingLocation}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {savingLocation ? 'Saving...' : editingLocationId ? 'Update Location' : 'Add Location'}
                    </button>
                    {editingLocationId && (
                      <button
                        onClick={resetLocationForm}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <div className="overflow-x-auto border rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">State</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">City</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sort</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loadingLocations && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                            Loading locations...
                          </td>
                        </tr>
                      )}
                      {!loadingLocations && locations.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                            No locations found. Add one or sync from properties.
                          </td>
                        </tr>
                      )}
                      {!loadingLocations && locations.map((location) => (
                        <tr key={location.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{location.state}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{location.city}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{location.sort_order}</td>
                          <td className="px-4 py-3 text-sm">
                            <button
                              onClick={() => toggleLocationActive(location)}
                              className={`px-2 py-1 rounded text-xs ${
                                location.is_active
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {location.is_active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => editLocation(location)}
                                className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded hover:bg-indigo-100"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteLocation(location.id)}
                                className="px-2 py-1 bg-red-50 text-red-700 rounded hover:bg-red-100"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
