'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useToastStore } from '@/store/toastStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserRound, Camera, Trash2, Edit3, X, Save, Shield, Mail, Phone, Info } from 'lucide-react';

const countries = [
  { code: '+91', name: 'India', iso: 'in' },
  { code: '+1', name: 'United States', iso: 'us' },
  { code: '+44', name: 'United Kingdom', iso: 'gb' },
  { code: '+61', name: 'Australia', iso: 'au' },
  { code: '+966', name: 'Saudi Arabia', iso: 'sa' },
  { code: '+971', name: 'United Arab Emirates', iso: 'ae' },
  { code: '+65', name: 'Singapore', iso: 'sg' },
  { code: '+49', name: 'Germany', iso: 'de' },
  { code: '+33', name: 'France', iso: 'fr' },
  { code: '+880', name: 'Bangladesh', iso: 'bd' },
  { code: '+92', name: 'Pakistan', iso: 'pk' },
  { code: '+977', name: 'Nepal', iso: 'np' },
  { code: '+94', name: 'Sri Lanka', iso: 'lk' },
  { code: '+974', name: 'Qatar', iso: 'qa' },
  { code: '+965', name: 'Kuwait', iso: 'kw' },
  { code: '+968', name: 'Oman', iso: 'om' },
  { code: '+973', name: 'Bahrain', iso: 'bh' }
];

export default function ProfilePage() {
  const { user, isAuthenticated, updateProfile, updateAvatar, loading } = useAuth();
  const router = useRouter();
  const { showToast } = useToastStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bio, setBio] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [gender, setGender] = useState('');

  // Parse phone stored format: e.g. "+91 9876543210" or "+19876543210" or "9876543210"
  const parsePhone = (rawPhone: string) => {
    if (!rawPhone) return { countryCode: '+91', number: '' };
    const clean = rawPhone.replace(/\s+/g, '');
    if (clean.startsWith('+')) {
      // Find the last 10 digits as the number
      const numberPart = clean.slice(-10);
      const codePart = clean.slice(0, -10);
      if (/^\d{10}$/.test(numberPart) && /^\+\d{1,4}$/.test(codePart)) {
        return { countryCode: codePart, number: numberPart };
      }
    }
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      return { countryCode: '+91', number: digitsOnly };
    }
    return { countryCode: '+91', number: clean };
  };

  // Validate mobile numbers strictly by country:
  // - must be exactly 10 digits
  // - country-specific mobile prefixes (no landlines)
  const validatePhone = (value: string, code: string): string => {
    if (!value || value.trim() === '') return ''; // optional field
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length !== 10) return `Phone must be exactly 10 digits (entered: ${digits.length})`;
    
    // Only block 0 if not allowed by local dial plans (e.g. Australia starting with 04 is valid, Saudi/UAE starting with 05 is valid)
    if (digits.startsWith('0') && code !== '+61' && code !== '+966' && code !== '+971') {
      return 'Phone number cannot start with 0';
    }
    
    // Country specific mobile patterns
    if (code === '+91') {
      if (!/^[6-9]/ .test(digits)) return 'Indian mobile numbers must start with 6, 7, 8, or 9';
    } else if (code === '+1') {
      if (!/^[2-9]/ .test(digits)) return 'US/Canada numbers must start with a digit between 2 and 9';
    } else if (code === '+44') {
      if (!/^7/ .test(digits)) return 'UK mobile numbers must start with 7';
    } else if (code === '+61') {
      if (!/^(04|4)/ .test(digits)) return 'Australian mobile numbers must start with 04 or 4';
    } else if (code === '+966' || code === '+971') {
      if (!/^(05|5)/ .test(digits)) return 'Mobile numbers must start with 05 or 5';
    }

    if (/^(.)\1{9}$/.test(digits)) return 'Phone cannot be all same digits (e.g. 9999999999)';
    return '';
  };

  // Sync state with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setBio(user.bio || '');
      setSpecialization(user.specialization || '');
      const parsed = parsePhone(user.phone || '');
      setCountryCode(parsed.countryCode);
      setPhone(parsed.number);
      setGender(user.gender || '');
    }
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) return null;

  // Generate initials for avatar fallback
  const getInitials = (userName: string) => {
    if (!userName) return 'U';
    return userName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Name cannot be empty.', 'error');
      return;
    }
    if (!email.trim()) {
      showToast('Email cannot be empty.', 'error');
      return;
    }

    // Phone validation (if provided)
    const trimmedPhone = phone.trim();
    if (trimmedPhone) {
      const phoneValidationError = validatePhone(trimmedPhone, countryCode);
      if (phoneValidationError) {
        setPhoneError(phoneValidationError);
        showToast(phoneValidationError, 'error');
        return;
      }
    }
    setPhoneError('');

    const oldEmail = user.email;
    const finalPhone = trimmedPhone ? `${countryCode} ${trimmedPhone}` : '';

    try {
      await updateProfile({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        specialization: specialization.trim(),
        phone: finalPhone,
        gender: gender,
      });

      // Sync with taskStore teamMembers cache
      const taskStore = useTaskStore.getState();
      const currentMember = taskStore.teamMembers.find(
        (m) => m.email?.toLowerCase() === oldEmail.toLowerCase()
      );
      if (currentMember) {
        taskStore.updateMember(currentMember.id, {
          name: name.trim(),
          email: email.trim(),
          bio: bio.trim(),
          specialization: specialization.trim(),
          phone: finalPhone,
          gender: gender,
        });
      }

      setIsEditing(false);
      showToast('Profile updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to update profile.', 'error');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Profile picture size must be less than 2MB.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const success = await updateAvatar(formData);
      if (success) {
        showToast('Profile picture updated.', 'success');

        // Sync with taskStore teamMembers cache
        const updatedUser = useAuthStore.getState().user;
        if (updatedUser) {
          const taskStore = useTaskStore.getState();
          const currentMember = taskStore.teamMembers.find(
            (m) => m.email?.toLowerCase() === updatedUser.email.toLowerCase()
          );
          if (currentMember) {
            taskStore.updateMember(currentMember.id, {
              avatar: updatedUser.avatar,
            });
          }
        }
      } else {
        showToast('Failed to upload image.', 'error');
      }
    } catch (err) {
      showToast('Error uploading image.', 'error');
    }
  };

  const handleAvatarRemove = async () => {
    try {
      await updateProfile({ avatar: '' });

      // Sync with taskStore teamMembers cache
      const taskStore = useTaskStore.getState();
      const currentMember = taskStore.teamMembers.find(
        (m) => m.email?.toLowerCase() === user.email.toLowerCase()
      );
      if (currentMember) {
        taskStore.updateMember(currentMember.id, {
          avatar: '',
        });
      }

      showToast('Profile picture removed.', 'success');
    } catch (err) {
      showToast('Failed to remove profile picture.', 'error');
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6 transition-all duration-300">

      {/* Header section */}
      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-heading">My Profile</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Keep your profile details up to date.</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs border border-primary/20">
          <UserRound className="h-6 w-6 text-accent" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left Side: Avatar Card */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-border/60 bg-card/60 backdrop-blur-md overflow-hidden text-center p-6 shadow-sm">
            <div className="flex flex-col items-center space-y-4">

              {/* Profile Avatar Frame */}
              <div className="relative group cursor-pointer" onClick={triggerFileInput}>
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-28 w-28 rounded-full object-cover border-2 border-border/80 shadow-md transition duration-300 group-hover:opacity-85"
                  />
                ) : (
                  <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-[#b89772]/20 to-[#c5a880]/30 border-2 border-accent/30 text-accent flex items-center justify-center text-3xl font-bold font-heading shadow-inner">
                    {getInitials(user.name)}
                  </div>
                )}

                {/* Upload Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>

              {/* Upload controls */}
              <div className="space-y-2 w-full">
                <h3 className="text-lg font-semibold text-foreground font-heading">{user.name}</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-secondary px-2.5 py-1 rounded-md text-muted-foreground">
                  <Shield className="h-3.5 w-3.5 text-accent" />
                  {user.role}
                </span>

                <div className="flex flex-col gap-2 pt-3 justify-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    className="hidden"
                    accept="image/*"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 gap-1.5 text-xs rounded-lg w-full"
                    onClick={triggerFileInput}
                    disabled={loading}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Change Image
                  </Button>

                  {user.avatar && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 gap-1.5 text-xs rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 w-full"
                      onClick={handleAvatarRemove}
                      disabled={loading}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove Picture
                    </Button>
                  )}
                </div>
              </div>

            </div>
          </Card>
        </div>

        {/* Right Side: Account details and Edit Form */}
        <div className="md:col-span-2">
          <Card className="border-border/60 bg-card/60 backdrop-blur-md shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
              <div>
                <CardTitle className="text-lg font-heading text-foreground">Account Information</CardTitle>
                <CardDescription className="text-xs">Update your personal details below.</CardDescription>
              </div>
              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-8 gap-1.5 text-xs rounded-lg"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Details
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {isEditing ? (
                <form onSubmit={handleProfileSave} className="space-y-4">

                  {/* Grid details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={100}
                        required
                        className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-foreground"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength={254}
                        required
                        className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-foreground"
                      />
                    </div>
                  </div>

                  {/* Row 2: Gender & Specialization side-by-side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-foreground cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>

                    {user.role === 'admin' ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialization</label>
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g. Backend Architecture"
                          className="w-full h-10 px-3 border border-border rounded-lg bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-foreground"
                        />
                      </div>
                    ) : user.specialization ? (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Specialization</label>
                        <div className="flex h-10 items-center px-3 border border-border/50 rounded-lg bg-muted text-sm text-muted-foreground font-medium">
                          {user.specialization}
                        </div>
                      </div>
                    ) : null}
                  </div>

                  {/* Row 3: Phone Number - moved to its own row below with max-w-md for professional styling */}
                  <div className="space-y-1.5 max-w-md">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Phone Number <span className="text-[10px] font-normal normal-case text-foreground/60">(optional, 10 digits)</span>
                    </label>
                    <div className="flex gap-2 relative">
                      {/* Custom Dropdown Trigger */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className={`w-28 h-10 px-3 border rounded-lg bg-secondary/30 text-sm flex items-center justify-between text-foreground cursor-pointer focus:outline-hidden focus:ring-2 transition ${
                            phoneError
                              ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                              : phone.length === 10 && !phoneError
                              ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500'
                              : 'border-border focus:ring-primary/20 focus:border-primary'
                          }`}
                        >
                          <span className="flex items-center gap-1.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://flagcdn.com/w20/${countries.find(c => c.code === countryCode)?.iso || 'in'}.png`}
                              width="20"
                              height="15"
                              alt=""
                              className="object-contain rounded-xs"
                            />
                            <span className="font-medium text-foreground">{countryCode}</span>
                          </span>
                          <span className="text-[10px] text-muted-foreground/60">▼</span>
                        </button>

                        {isDropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-40 bg-transparent"
                              onClick={() => setIsDropdownOpen(false)}
                            />
                            <div className="absolute top-11 left-0 z-50 w-56 max-h-60 overflow-y-auto border border-border rounded-lg bg-card shadow-lg py-1 transition-all duration-200">
                              {countries.map((c) => (
                                <button
                                  key={`${c.code}-${c.name}`}
                                  type="button"
                                  onClick={() => {
                                    setCountryCode(c.code);
                                    setIsDropdownOpen(false);
                                    setPhoneError(validatePhone(phone, c.code));
                                  }}
                                  className="w-full h-9 px-3 flex items-center gap-2 hover:bg-secondary/40 text-sm text-foreground transition text-left cursor-pointer"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={`https://flagcdn.com/w20/${c.iso}.png`}
                                    width="20"
                                    height="15"
                                    alt=""
                                    className="object-contain rounded-xs shrink-0"
                                  />
                                  <span className="font-medium">{c.code}</span>
                                  <span className="text-[11px] text-muted-foreground truncate flex-1">({c.name})</span>
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          // Only allow digits, max 10
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhone(val);
                          setPhoneError(validatePhone(val, countryCode));
                        }}
                        placeholder="e.g. 9876543210"
                        maxLength={10}
                        inputMode="numeric"
                        className={`flex-1 h-10 px-3 border rounded-lg bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 transition text-foreground ${phoneError
                            ? 'border-rose-500 focus:ring-rose-500/20 focus:border-rose-500'
                            : phone.length === 10 && !phoneError
                              ? 'border-emerald-500 focus:ring-emerald-500/20 focus:border-emerald-500'
                              : 'border-border focus:ring-primary/20 focus:border-primary'
                          }`}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-0.5 flex items-center gap-1">
                        <span>⚠</span> {phoneError}
                      </p>
                    )}
                    {!phoneError && phone.length === 10 && (
                      <p className="text-[11px] font-semibold text-emerald-500 mt-0.5">✓ Valid phone number</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      Bio
                      <span className="text-[10px] text-muted-foreground/50 font-normal normal-case">(optional)</span>
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full px-3 py-2 border border-border rounded-lg bg-secondary/30 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none text-foreground"
                    />
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 justify-end pt-4 border-t border-border/40">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setName(user.name || '');
                        setEmail(user.email || '');
                        setBio(user.bio || '');
                        setSpecialization(user.specialization || '');
                        const parsed = parsePhone(user.phone || '');
                        setCountryCode(parsed.countryCode);
                        setPhone(parsed.number);
                        setPhoneError('');
                        setGender(user.gender || '');
                      }}
                      className="h-9 gap-1.5 text-xs rounded-lg"
                      disabled={loading}
                    >
                      <X className="h-3.5 w-3.5" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      className="h-9 gap-1.5 text-xs rounded-lg"
                      disabled={loading}
                    >
                      <Save className="h-3.5 w-3.5" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              ) : (
                // View Details Mode
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Email Read-only */}
                    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/40 bg-secondary/20">
                      <Mail className="h-5 w-5 text-accent mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</span>
                        <p className="text-sm font-medium text-foreground">{user.email}</p>
                      </div>
                    </div>

                    {/* Role Display */}
                    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/40 bg-secondary/20">
                      <Shield className="h-5 w-5 text-accent mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Workspace Role</span>
                        <p className="text-sm font-medium text-foreground capitalize">{user.role}</p>
                      </div>
                    </div>

                    {/* Phone Display */}
                    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/40 bg-secondary/20">
                      <Phone className="h-5 w-5 text-accent mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</span>
                        <p className="text-sm font-medium text-foreground">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>

                    {/* Gender Display */}
                    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/40 bg-secondary/20">
                      <UserRound className="h-5 w-5 text-accent mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gender</span>
                        <p className="text-sm font-medium text-foreground">{user.gender || 'Not provided'}</p>
                      </div>
                    </div>

                  </div>

                  {/* Specialization View */}
                  {user.specialization && (
                    <div className="flex items-start gap-3 p-3.5 rounded-lg border border-border/40 bg-secondary/20">
                      <Info className="h-5 w-5 text-accent mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Area of Expertise</span>
                        <p className="text-sm font-medium text-foreground">{user.specialization}</p>
                      </div>
                    </div>
                  )}

                  {/* Bio View */}
                  <div className="space-y-1.5 border-t border-border/40 pt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">About Me / Bio</span>
                    <p className="text-sm text-foreground/85 leading-relaxed bg-secondary/10 p-3.5 rounded-lg border border-border/30 min-h-[5rem]">
                      {user.bio || "No biography provided. Click 'Edit Details' to add a bio."}
                    </p>
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
