# Clear any existing rules and set default policies
#DNS_IP=$(dig +short av4i3hb6jgt89-ats.iot.us-east-1.amazonaws.com)
# Flush all existing rules
iptables -F

# Set default policies to DROP
iptables -P INPUT ACCEPT  # Optional: Set default policy for INPUT chain
iptables -P FORWARD ACCEPT  # Optional: Set default policy for FORWARD chain
iptables -P OUTPUT DROP  # Set default policy for OUTPUT chain

# Allow loopback traffic
iptables -A INPUT -i lo -j ACCEPT
iptables -A OUTPUT -o lo -j ACCEPT

# Allow incoming SSH traffic (assuming SSH uses port 22)
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow DNS queries to specific DNS servers (replace IP addresses with your DNS servers)
iptables -A OUTPUT -p udp --dport 53 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 53 -j ACCEPT

iptables -A INPUT -p tcp --dport 9412 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 9412 -j ACCEPT

iptables -A OUTPUT -p udp --dport 8883 -j ACCEPT
iptables -A OUTPUT -p tcp --dport 8883 -j ACCEPT

iptables -A OUTPUT -p tcp -d 192.168.0.1 --dport 80 -j ACCEPT
iptables -A INPUT -p tcp -d 192.168.0.1 --dport 80 -j ACCEPT

iptables -A OUTPUT -p tcp -d 192.168.0.1 --dport 443 -j ACCEPT
iptables -A INPUT -p tcp -d 192.168.0.1 --dport 443 -j ACCEPT

# Allow outgoing NTP traffic (UDP port 123)
iptables -A OUTPUT -p udp --dport 123 -j ACCEPT

# Allow established connections and related traffic
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT

#for ip in $DNS_IP; do
#  iptables -A OUTPUT -p udp -d $ip -j ACCEPT
#  iptables -A OUTPUT -d $ip -j ACCEPT
#  iptables -A INPUT -s $ip -j ACCEPT
#  iptables -A INPUT -p udp -s $ip -j ACCEPT
#done

# Drop all other incoming and outgoing traffic
iptables -A INPUT -j DROP
iptables -A OUTPUT -j DROP
